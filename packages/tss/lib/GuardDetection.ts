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
  protected readonly guardsUpdateStatusInterval: number = 3 * 1000; // 3 seconds
  constructor(handler: MessageHandler, config: GuardDetectionConfig) {
    this.handler = handler;
    this.approvedPublicKeys = config.guardsPublicKey;
    this.logger = config.logger;
    this.publicKey = config.publicKey;
    let guardsCount = config.guardsPublicKey.length;
    while (guardsCount--)
      this.guardsInfo.push({
        peerId: '',
        nounce: '',
        lastUpdate: 0,
      });
  }

  /**
   * Initialize the guard detection
   * @returns {Promise<void>}
   */
  public async init(): Promise<void> {
    await this.updateGuardsStatus();
  }

  /**
   * Generate a random nounce in base64 format
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
          this.handler.checkSign(
            parsedMessage.payload,
            parsedMessage.signature,
            parsedMessage.pk
          )
        ) {
          return true;
        }
      }
    } catch (e) {
      this.logger.warn(`An Error occurred while checking message sign: ${e}`);
    }
    return false;
  }

  /**
   * Check if the timestamp is less than the timestampTolerance
   * @param timestamp - timestamp to check
   * @protected
   */
  protected checkTimestamp(timestamp: number): boolean {
    return Date.now() - timestamp < this.timestampTolerance;
  }

  /**
   * returns the index of the public key in the approvedPublicKeys array
   * @param publicKey - public key of the guard
   * @protected
   */
  protected publicKeyToIndex(publicKey: string): number {
    return this.approvedPublicKeys.indexOf(publicKey);
  }

  /**
   * handle Register message from other node in the network and send approve
   * message with new nounce
   * @param _payload - RegisterPayload
   * @param sender - public key of sender
   * @protected
   */
  protected async handleRegisterMessage(
    _payload: RegisterPayload,
    sender: string
  ): Promise<void> {
    try {
      const receivedNounce = _payload.nounce;
      const nounce = this.generateNounce();
      const payload: ApprovePayload = {
        nounce: nounce,
        receivedNounce: receivedNounce,
        timestamp: Date.now(),
      };
      this.guardsInfo[this.publicKeyToIndex(sender)].nounce = nounce;
      await this.handler.send({
        type: 'approve',
        payload: this.handler.encrypt(JSON.stringify(payload)),
        signature: this.handler.sign(JSON.stringify(payload)),
        receiver: sender,
        pk: this.publicKey,
      });
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling register message: ${e}`
      );
    }
  }

  /**
   * handle Approve message from other node in the network
   * @param _payload - ApprovePayload
   * @param sender - public key of sender
   * @param senderPeerId - peerId of sender
   * @private
   */
  protected async handleApproveMessage(
    _payload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ): Promise<void> {
    try {
      const receivedNounce = _payload.receivedNounce;
      const nounce = _payload.nounce;
      const index = this.publicKeyToIndex(sender);
      if (this.guardsInfo[index].nounce === receivedNounce) {
        const currentTime = Date.now();
        if (currentTime - _payload.timestamp < this.guardsHeartbeatTimeout) {
          this.guardsInfo[index].peerId = senderPeerId;
          this.guardsInfo[index].lastUpdate = currentTime;
        }
        if (nounce) {
          const payload: ApprovePayload = {
            receivedNounce: nounce,
            timestamp: Date.now(),
          };
          const payloadString = JSON.stringify(payload);
          await this.handler.send({
            type: 'approve',
            payload: this.handler.encrypt(payloadString),
            signature: this.handler.sign(payloadString),
            receiver: sender,
            pk: this.publicKey,
          });
        }
      }
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling approve message: ${e}`
      );
    }
  }

  /**
   * handle Heartbeat message from other node in the network and send approve message
   * to sender of heartbeat message
   * @param _payload - HeartbeatPayload
   * @param sender - public key of sender
   * @private
   */
  protected async handleHeartbeatMessage(
    _payload: HeartbeatPayload,
    sender: string
  ): Promise<void> {
    try {
      const nounce = _payload.nounce;
      const payload: ApprovePayload = {
        receivedNounce: nounce,
        timestamp: Date.now(),
      };
      const payloadString = JSON.stringify(payload);
      await this.handler.send({
        type: 'approve',
        payload: this.handler.encrypt(payloadString),
        signature: this.handler.sign(payloadString),
        receiver: sender,
        pk: this.publicKey,
      });
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling heartbeat message: ${e}`
      );
    }
  }

  /**
   * handle receive message from other node in the network
   * @param message - message from other node in the network
   * @param senderPeerId - peer id of sender
   * @public
   */
  public async handleReceiveMessage(
    message: string,
    senderPeerId: string
  ): Promise<void> {
    try {
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
            return await this.handleRegisterMessage(
              payload as RegisterPayload,
              parsedMessage.pk
            );
          case 'approve':
            return await this.handleApproveMessage(
              payload as ApprovePayload,
              parsedMessage.pk,
              senderPeerId
            );
          case 'heartbeat':
            return await this.handleHeartbeatMessage(
              payload as HeartbeatPayload,
              parsedMessage.pk
            );
        }
      }
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling receive message: ${e}`
      );
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
  protected async updateGuardsStatus() {
    const currentTime = Date.now();
    try {
      for (let index = 0; index < this.guardsInfo.length; index++) {
        const guard = this.guardsInfo[index];
        if (
          currentTime - this.guardsInfo[index].lastUpdate >
          this.guardsRegisterTimeout
        ) {
          const nounce = this.generateNounce();
          const payload: HeartbeatPayload = {
            nounce: nounce,
            timestamp: Date.now(),
          };
          const payloadString = JSON.stringify(payload);
          this.guardsInfo[index].nounce = nounce;
          await this.handler.send({
            type: 'register',
            payload: this.handler.encrypt(payloadString),
            signature: this.handler.sign(payloadString),
            receiver: this.approvedPublicKeys[index],
            pk: this.publicKey,
          });
        } else if (
          currentTime - guard.lastUpdate >
          this.guardsHeartbeatTimeout
        ) {
          const nounce = this.generateNounce();
          const payload: HeartbeatPayload = {
            nounce: nounce,
            timestamp: Date.now(),
          };
          const payloadString = JSON.stringify(payload);
          guard.nounce = nounce;
          await this.handler.send({
            type: 'heartbeat',
            payload: this.handler.encrypt(payloadString),
            signature: this.handler.sign(payloadString),
            receiver: this.approvedPublicKeys[index],
            pk: this.publicKey,
          });
        }
      }
    } catch (e) {
      this.logger.warn(`An Error occurred while updating guards status: ${e}`);
    }
    setTimeout(() => {
      this.updateGuardsStatus();
    }, this.guardsUpdateStatusInterval);
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
