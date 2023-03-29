import * as crypto from 'crypto';
import {
  ApprovePayload,
  GuardDetectionConfig,
  GuardInfo,
  HeartbeatPayload,
  Message,
  MessageHandler,
  RegisterPayload,
} from './types/types';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

class GuardDetection {
  protected handler: MessageHandler;
  protected readonly publicKey: string;
  protected approvedPublicKeys: string[];
  protected guardsInfo: GuardInfo[] = [];
  protected readonly logger: AbstractLogger;
  protected readonly guardsRegisterTimeout: number = 2 * 60 * 1000; // 2 minutes
  protected readonly guardsHeartbeatTimeout: number = 1 * 60 * 1000; // 1 minutes
  protected readonly timestampTolerance: number = 1 * 60 * 1000; // 1 minutes
  constructor(handler: MessageHandler, config: GuardDetectionConfig) {
    this.handler = handler;
    this.approvedPublicKeys = config.guardsPublicKey;
    this.logger = config.logger;
    this.publicKey = config.publicKey;
    this.guardsInfo = Array(config.guardsPublicKey.length).fill({
      peerId: '',
      nounce: '',
      lastUpdate: 0,
    });
  }

  /**
   * Generate a random nounce
   * @param size - size of the nounce in bytes
   * @private
   */
  private generateNounce(size = 32): string {
    return crypto.randomBytes(size).toString('base64');
  }

  /**
   * Check Message Sign and return true if the message is valid and false if not
   * @param parsedMessage - parsed message
   * @private
   */
  protected checkMessageSign(parsedMessage: Message): boolean {
    try {
      if (this.approvedPublicKeys.includes(parsedMessage.pk)) {
        if (
          this.handler.checkSign(parsedMessage.payload, parsedMessage.signature)
        ) {
          return true;
        }
      }
    } catch (e) {
      this.logger.warn(`An Error occurred while checking message sign: ${e}`);
    }
    return false;
  }

  protected checkTimestamp(timestamp: number): boolean {
    return Date.now() - timestamp < this.timestampTolerance;
  }

  /**
   * returns the index of the public key in the approvedPublicKeys array
   * @param publicKey - public key of the guard
   * @private
   */
  protected publicKeyToIndex(publicKey: string): number {
    return this.approvedPublicKeys.indexOf(publicKey);
  }

  /**
   * handle Register message from other node in the network and send approve
   * message with new nounce
   * @param _payload - RegisterPayload
   * @param sender - public key of sender
   * @private
   */
  protected handleRegisterMessage(
    _payload: RegisterPayload,
    sender: string
  ): void {
    const receivedNounce = _payload.nounce;
    const nounce = this.generateNounce();
    const payload: ApprovePayload = {
      nounce: nounce,
      receivedNounce: receivedNounce,
      timestamp: Date.now(),
    };
    this.guardsInfo[this.publicKeyToIndex(sender)].nounce = nounce;
    this.handler.send({
      type: 'approve',
      payload: this.handler.encrypt(JSON.stringify(payload)),
      signature: this.handler.sign(JSON.stringify(payload)),
      receiver: sender,
      pk: this.publicKey,
    });
  }

  /**
   * handle Approve message from other node in the network
   * @param _payload - ApprovePayload
   * @param sender - public key of sender
   * @param senderPeerId - peerId of sender
   * @private
   */
  protected handleApproveMessage(
    _payload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ): void {
    const receivedNounce = _payload.receivedNounce;
    const nounce = _payload.nounce;
    const index = this.publicKeyToIndex(sender);
    if (this.guardsInfo[index].nounce === receivedNounce) {
      const currentTime = Date.now();
      if (
        currentTime - this.guardsInfo[index].lastUpdate <
        this.guardsHeartbeatTimeout
      ) {
        this.guardsInfo[index].peerId = senderPeerId;
        this.guardsInfo[index].lastUpdate = currentTime;
      }
      if (nounce) {
        const payload: ApprovePayload = {
          receivedNounce: nounce,
          timestamp: Date.now(),
        };
        const payloadString = JSON.stringify(payload);

        this.handler.send({
          type: 'approve',
          payload: this.handler.encrypt(payloadString),
          signature: this.handler.sign(payloadString),
          receiver: sender,
          pk: this.publicKey,
        });
      }
    }
  }

  /**
   * handle Heartbeat message from other node in the network and send approve message
   * to sender of heartbeat message
   * @param _payload - HeartbeatPayload
   * @param sender - public key of sender
   * @private
   */
  protected handleHeartbeatMessage(
    _payload: HeartbeatPayload,
    sender: string
  ): void {
    const nounce = _payload.nounce;
    const payload: ApprovePayload = {
      receivedNounce: nounce,
      timestamp: Date.now(),
    };
    const payloadString = JSON.stringify(payload);
    this.handler.send({
      type: 'approve',
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: sender,
      pk: this.publicKey,
    });
  }

  /**
   * handle receive message from other node in the network
   * @param message - message from other node in the network
   * @param senderPeerId - peer id of sender
   * @private
   */
  protected handleReceiveMessage(message: string, senderPeerId: string): void {
    const parsedMessage: Message = JSON.parse(message);
    if (this.checkMessageSign(parsedMessage)) {
      const payload: RegisterPayload | ApprovePayload | HeartbeatPayload =
        JSON.parse(this.handler.decrypt(parsedMessage.payload));
      if (!this.checkTimestamp(payload.timestamp)) {
        this.logger.debug(
          `Message from peer ${senderPeerId} timestamp is not valid`
        );
        return;
      }
      switch (parsedMessage.type) {
        case 'register':
          return this.handleRegisterMessage(
            payload as RegisterPayload,
            parsedMessage.pk
          );
        case 'approve':
          return this.handleApproveMessage(
            payload as ApprovePayload,
            parsedMessage.pk,
            senderPeerId
          );
        case 'heartbeat':
          return this.handleHeartbeatMessage(
            payload as HeartbeatPayload,
            parsedMessage.pk
          );
      }
    }
  }

  /**
   * update guards status
   * if guard is pass `guardHeartbeatTimeout` should message of type heartbeat send
   * to that guard and the payload is the new nounce.
   * if guard is pass `guardRegisterTimeout` should message of type register send
   * to that guard and the payload is the new nounce.
   * @protected
   */
  protected updateGuardsStatus() {
    const currentTime = Date.now();
    for (let index = 0; index < this.guardsInfo.length; index++) {
      const guard = this.guardsInfo[index];
      if (currentTime - guard.lastUpdate > this.guardsRegisterTimeout) {
        const nounce = this.generateNounce();
        const payload: HeartbeatPayload = {
          nounce: nounce,
          timestamp: Date.now(),
        };
        const payloadString = JSON.stringify(payload);

        this.handler.send({
          type: 'register',
          payload: this.handler.encrypt(payloadString),
          signature: this.handler.sign(payloadString),
          receiver: this.approvedPublicKeys[index],
          pk: this.publicKey,
        });
        guard.nounce = nounce;
      } else {
        const nounce = this.generateNounce();
        const payload: HeartbeatPayload = {
          nounce: nounce,
          timestamp: Date.now(),
        };
        const payloadString = JSON.stringify(payload);
        this.handler.send({
          type: 'heartbeat',
          payload: this.handler.encrypt(payloadString),
          signature: this.handler.sign(payloadString),
          receiver: this.approvedPublicKeys[index],
          pk: this.publicKey,
        });
        guard.nounce = nounce;
      }
    }
  }

  /**
   * getting active guards peer id
   * @returns {string[]} - array of active guards peer id
   */
  public getActiveGuards(): string[] {
    const currentTime = Date.now();
    return this.guardsInfo
      .filter((guard) => {
        return (
          guard.peerId !== '' &&
          currentTime - guard.lastUpdate < this.guardsRegisterTimeout
        );
      })
      .map((guard) => guard.peerId);
  }
}

export { GuardDetection };
