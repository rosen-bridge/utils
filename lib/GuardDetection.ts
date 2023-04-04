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
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import {
  approveType,
  guardsUpdateStatusInterval,
  heartbeatTimeout,
  heartbeatType,
  registerTimeout,
  registerType,
  timestampTolerance,
} from './constants/constants';

class GuardDetection {
  protected handler: MessageHandler;
  protected readonly publicKey: string;
  protected guardsInfo: GuardInfo[] = [];
  protected readonly logger: AbstractLogger;
  protected readonly guardsRegisterTimeout: number;
  protected readonly guardsHeartbeatTimeout: number;
  protected readonly timestampTolerance: number;
  protected readonly guardsUpdateStatusInterval: number;
  constructor(handler: MessageHandler, config: GuardDetectionConfig) {
    this.handler = handler;
    this.logger = config.logger || new DummyLogger();
    this.guardsRegisterTimeout =
      config.guardsRegisterTimeout || registerTimeout;
    this.guardsHeartbeatTimeout =
      config.guardsHeartbeatTimeout || heartbeatTimeout;
    this.timestampTolerance = config.timestampTolerance || timestampTolerance;
    this.guardsUpdateStatusInterval =
      config.guardsUpdateStatusInterval || guardsUpdateStatusInterval;
    this.publicKey = config.publicKey;
    let guardsCount = config.guardsPublicKey.length;
    while (guardsCount--)
      this.guardsInfo.push({
        peerId: '',
        nonce: '',
        lastUpdate: 0,
        publicKey: config.guardsPublicKey[guardsCount],
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
   * Generate a random nonce in base64 format
   * @param size - size of the nonce in bytes
   * @private
   */
  private generateNonce(size = 32): string {
    return crypto.randomBytes(size).toString('base64');
  }

  /**
   * Check Message Sign and return true if the message is valid and false if not
   * @param parsedMessage - parsed message
   * @private
   */
  protected checkMessageSign(parsedMessage: Message): boolean {
    try {
      if (this.publicKeyToIndex(parsedMessage.pk) !== -1) {
        if (
          this.handler.checkSign(
            parsedMessage.payload,
            parsedMessage.signature,
            parsedMessage.pk
          )
        ) {
          return true;
        } else {
          this.logger.warn(`Signature from ${parsedMessage.pk} is not valid`);
        }
      } else {
        this.logger.warn(`Public key ${parsedMessage.pk} is not approved`);
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
    for (let i = 0; i < this.guardsInfo.length; i++) {
      if (this.guardsInfo[i].publicKey === publicKey) return i;
    }
    return -1;
  }

  /**
   * handle Register message from other node in the network and send approve
   * message with new nonce
   * @param registerPayload - RegisterPayload
   * @param sender - public key of sender
   * @protected
   */
  protected async handleRegisterMessage(
    registerPayload: RegisterPayload,
    sender: string
  ): Promise<void> {
    try {
      const receivednonce = registerPayload.nonce;
      const nonce = this.generateNonce();
      const payload: ApprovePayload = {
        nonce: nonce,
        receivedNonce: receivednonce,
        timestamp: Date.now(),
      };
      this.guardsInfo[this.publicKeyToIndex(sender)].nonce = nonce;
      await this.handler.send({
        type: approveType,
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
   * @param approvePayload - ApprovePayload
   * @param sender - public key of sender
   * @param senderPeerId - peerId of sender
   * @private
   */
  protected async handleApproveMessage(
    approvePayload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ): Promise<void> {
    try {
      const receivedNonce = approvePayload.receivedNonce;
      const nonce = approvePayload.nonce;
      const index = this.publicKeyToIndex(sender);
      if (this.guardsInfo[index].nonce === receivedNonce) {
        const currentTime = Date.now();
        if (
          currentTime - approvePayload.timestamp <
          this.guardsHeartbeatTimeout
        ) {
          this.guardsInfo[index].peerId = senderPeerId;
          this.guardsInfo[index].lastUpdate = currentTime;
        }
        if (nonce) {
          const payload: ApprovePayload = {
            receivedNonce: nonce,
            timestamp: Date.now(),
          };
          const payloadString = JSON.stringify(payload);
          await this.handler.send({
            type: approveType,
            payload: this.handler.encrypt(payloadString),
            signature: this.handler.sign(payloadString),
            receiver: sender,
            pk: this.publicKey,
          });
        }
      } else {
        this.logger.warn(`Received nonce from ${sender} is not valid`);
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
   * @param heartbeatPayload - HeartbeatPayload
   * @param sender - public key of sender
   * @private
   */
  protected async handleHeartbeatMessage(
    heartbeatPayload: HeartbeatPayload,
    sender: string
  ): Promise<void> {
    try {
      const nonce = heartbeatPayload.nonce;
      const payload: ApprovePayload = {
        receivedNonce: nonce,
        timestamp: Date.now(),
      };
      const payloadString = JSON.stringify(payload);
      await this.handler.send({
        type: approveType,
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
          case registerType:
            return await this.handleRegisterMessage(
              payload as RegisterPayload,
              parsedMessage.pk
            );
          case approveType:
            return await this.handleApproveMessage(
              payload as ApprovePayload,
              parsedMessage.pk,
              senderPeerId
            );
          case heartbeatType:
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
   * send register message to other node in the network
   * @param guardIndex - index of guard in guardsInfo array
   * @protected
   */
  protected async sendRegisterMessage(guardIndex: number) {
    const nonce = this.generateNonce();
    const payload: RegisterPayload = {
      nonce: nonce,
      timestamp: Date.now(),
    };
    const payloadString = JSON.stringify(payload);
    await this.handler.send({
      type: registerType,
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: this.guardsInfo[guardIndex].publicKey,
      pk: this.publicKey,
    });
  }

  /**
   * send heartbeat message to other node in the network
   * @param guardIndex - index of guard in guardsInfo array
   * @protected
   */
  protected async sendHeartbeatMessage(guardIndex: number) {
    const nonce = this.generateNonce();
    const payload: HeartbeatPayload = {
      nonce: nonce,
      timestamp: Date.now(),
    };
    const payloadString = JSON.stringify(payload);
    await this.handler.send({
      type: heartbeatType,
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: this.guardsInfo[guardIndex].publicKey,
      pk: this.publicKey,
    });
  }

  /**
   * update guards status
   * if guard is pass `guardHeartbeatTimeout` should message of type heartbeat send
   * to that guard and the payload is the new nonce.
   * if guard is pass `guardRegisterTimeout` should message of type register send
   * to that guard and the payload is the new nonce.
   * @protected
   */
  protected async updateGuardsStatus() {
    const currentTime = Date.now();
    try {
      for (let index = 0; index < this.guardsInfo.length; index++) {
        const guard = this.guardsInfo[index];
        if (currentTime - guard.lastUpdate > this.guardsRegisterTimeout) {
          await this.sendRegisterMessage(index);
        } else if (
          currentTime - guard.lastUpdate >
          this.guardsHeartbeatTimeout
        ) {
          await this.sendHeartbeatMessage(index);
        }
      }
    } catch (e) {
      this.logger.warn(`An Error occurred while updating guards status: ${e}`);
    }
  }

  /**
   * get active guards publicKey and peerId
   * @public
   * @returns { { peerId:string,publicKey:string }[] }
   */
  public getActiveGuards(): { peerId: string; publicKey: string }[] {
    const currentTime = Date.now();
    return this.guardsInfo
      .filter((guard) => {
        return (
          guard.peerId !== '' &&
          currentTime - guard.lastUpdate < this.guardsRegisterTimeout
        );
      })
      .map((guard) => {
        return { peerId: guard.peerId, publicKey: guard.publicKey };
      });
  }
}

export { GuardDetection };
