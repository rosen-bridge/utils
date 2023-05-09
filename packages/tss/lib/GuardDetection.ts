import * as crypto from 'crypto';
import {
  ActiveGuard,
  ApprovePayload,
  GuardDetectionConfig,
  GuardInfo,
  HeartbeatPayload,
  Message,
  MessageHandler,
  RegisterPayload,
  RequestToSignPayload,
  SignPayload,
} from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/logger-interface';
import {
  approveType,
  guardsUpdateStatusInterval,
  heartbeatTimeout,
  heartbeatType,
  registerTimeout,
  registerType,
  messageValidDuration,
  signType,
  approveMessageTimeout,
  requestToSignType,
  oneMinute,
  minimumTimeRemainedToSign,
} from './constants/constants';
import { blake2b } from 'blakejs';
import pkg from 'secp256k1';

class GuardDetection {
  protected handler: MessageHandler;
  protected readonly publicKey: string;
  protected readonly privateKey: string;
  protected readonly index: number;
  protected guardsInfo: GuardInfo[] = [];
  protected readonly logger: AbstractLogger;
  protected readonly guardsRegisterTimeout: number;
  protected readonly guardsHeartbeatTimeout: number;
  protected readonly messageValidDuration: number;
  protected readonly guardsUpdateStatusInterval: number;
  protected readonly minimumSigner: number;
  protected payloadsToSignQueue: Array<string> = [];
  protected payloadToSignMap: Map<
    string,
    {
      active: Array<string>;
      signed: Array<{ publicKey: string; sign: string }>;
    }
  > = new Map<
    string,
    {
      active: Array<string>;
      signed: Array<{ publicKey: string; sign: string }>;
    }
  >();

  constructor(handler: MessageHandler, config: GuardDetectionConfig) {
    this.handler = handler;
    this.index = config.index;
    this.minimumSigner = config.minimumSigner;
    this.logger = config.logger || new DummyLogger();
    this.guardsRegisterTimeout =
      config.guardsRegisterTimeout || registerTimeout;
    this.guardsHeartbeatTimeout =
      config.guardsHeartbeatTimeout || heartbeatTimeout;
    this.messageValidDuration =
      config.messageValidDuration || messageValidDuration;
    this.guardsUpdateStatusInterval =
      config.guardsUpdateStatusInterval || guardsUpdateStatusInterval;
    this.publicKey = config.publicKey;
    this.privateKey = config.privateKey;
    let guardsCount = config.guardsPublicKey.length;
    while (guardsCount--)
      this.guardsInfo.push({
        peerId: '',
        nonce: '',
        lastUpdate: 0,
        publicKey: config.guardsPublicKey[guardsCount],
        recognitionPromises: [],
      });
  }

  /**
   * Initialize the guard detection
   * @returns
   */
  public init = async (): Promise<void> => {
    await this.updateGuardsStatus();
  };

  /**
   * Generate a random nonce in base64 format
   * @param size - size of the nonce in bytes
   * @private
   */
  private generateNonce = (size = 32): string => {
    return crypto.randomBytes(size).toString('base64');
  };

  /**
   * Check Message Sign and return true if the message is valid and false if not
   * @param parsedMessage - parsed message
   * @protected
   */
  protected checkMessageSign = (parsedMessage: Message): boolean => {
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
      if (e instanceof Error && e.stack) {
        this.logger.warn(e.stack);
      }
    }
    return false;
  };

  /**
   * Check if the timestamp is less than the timestampTolerance
   * @param timestamp - timestamp to check
   * @protected
   */
  protected checkTimestamp = (timestamp: number): boolean => {
    return Date.now() - timestamp < this.messageValidDuration;
  };

  /**
   * returns the index of the public key in the approvedPublicKeys array
   * @param publicKey - public key of the guard
   * @protected
   */
  protected publicKeyToIndex = (publicKey: string): number => {
    return this.guardsInfo.findIndex((guard) => guard.publicKey === publicKey);
  };

  /**
   * handle Register message from other node in the network and send approval
   * message with new nonce
   * @param registerPayload - RegisterPayload
   * @param sender - public key of sender
   * @protected
   */
  protected handleRegisterMessage = async (
    registerPayload: RegisterPayload,
    sender: string
  ): Promise<void> => {
    try {
      const receivedNonce = registerPayload.nonce;
      const nonce = this.generateNonce();
      const payload: ApprovePayload = {
        nonce: nonce,
        receivedNonce: receivedNonce,
        timestamp: Date.now(),
      };
      const guardIndex = this.publicKeyToIndex(sender);
      this.guardsInfo[guardIndex].nonce = nonce;
      await this.handler.send({
        type: approveType,
        payload: this.handler.encrypt(JSON.stringify(payload)),
        signature: this.handler.sign(JSON.stringify(payload)),
        receiver: sender,
        pk: this.publicKey,
      });
      this.logger.debug(
        `Sent approval to register request of guard [${guardIndex}]`
      );
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling register message: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.warn(e.stack);
      }
    }
  };

  /**
   * handle approval message from other node in the network
   * @param approvePayload - ApprovePayload
   * @param sender - public key of sender
   * @param senderPeerId - peerId of sender
   * @protected
   */
  protected handleApproveMessage = async (
    approvePayload: ApprovePayload,
    sender: string,
    senderPeerId: string
  ): Promise<void> => {
    try {
      const receivedNonce = approvePayload.receivedNonce;
      const nonce = approvePayload.nonce;
      const index = this.publicKeyToIndex(sender);
      const guard = this.guardsInfo[index];
      if (guard.nonce === receivedNonce) {
        const currentTime = Date.now();
        if (
          currentTime - approvePayload.timestamp <
          this.guardsHeartbeatTimeout
        ) {
          this.guardsInfo[index].peerId = senderPeerId;
          this.guardsInfo[index].lastUpdate = currentTime;
          this.logger.debug(
            `Received approval message updating guard with index [${index}]`
          );
          if (guard.recognitionPromises.length > 0) {
            guard.recognitionPromises.forEach((resolve) => resolve(true));
            guard.recognitionPromises = [];
          }
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
          this.logger.debug(
            `Sent approval to register message guard with index [${index}]`
          );
        }
      } else {
        this.logger.warn(
          `Received nonce from guard with index [${index}] is not valid`
        );
      }
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling approval message: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.warn(e.stack);
      }
    }
  };

  /**
   * handle Heartbeat message from other node in the network and send approval message
   * to sender of heartbeat message
   * @param heartbeatPayload - HeartbeatPayload
   * @param sender - public key of sender
   * @protected
   */
  protected handleHeartbeatMessage = async (
    heartbeatPayload: HeartbeatPayload,
    sender: string
  ): Promise<void> => {
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
      this.logger.debug(
        `Sent approval message to heartbeat message guard with index [${this.publicKeyToIndex(
          sender
        )}]`
      );
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling heartbeat message: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.warn(e.stack);
      }
    }
  };

  /**
   * handle receive message from other node in the network
   * @param message - message from other node in the network
   * @param senderPeerId - peer id of sender
   * @public
   */
  public handleReceiveMessage = async (
    message: string,
    senderPeerId: string
  ): Promise<void> => {
    try {
      const parsedMessage: Message = JSON.parse(message);
      if (this.checkMessageSign(parsedMessage)) {
        const payload:
          | RegisterPayload
          | ApprovePayload
          | HeartbeatPayload
          | RequestToSignPayload
          | SignPayload = JSON.parse(
          this.handler.decrypt(parsedMessage.payload)
        );
        if (!this.checkTimestamp(payload.timestamp)) {
          this.logger.warn(
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
          case requestToSignType:
            return await this.handleRequestToSignMessage(
              payload as RequestToSignPayload,
              parsedMessage.pk
            );
          case signType:
            return await this.handleSignMessage(
              payload as SignPayload,
              parsedMessage.pk,
              senderPeerId
            );
        }
      }
    } catch (e) {
      this.logger.warn(
        `An Error occurred while handling receive message: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.warn(e.stack);
      }
    }
  };

  /**
   * send register message to other node in the network
   * @param guardIndex - index of guard in guardsInfo array
   * @protected
   */
  protected sendRegisterMessage = async (guardIndex: number) => {
    this.logger.debug(`Sending register message to ${guardIndex} guard`);
    const nonce = this.generateNonce();
    const payload: RegisterPayload = {
      nonce: nonce,
      timestamp: Date.now(),
    };
    this.guardsInfo[guardIndex].nonce = nonce;
    const payloadString = JSON.stringify(payload);
    await this.handler.send({
      type: registerType,
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: this.guardsInfo[guardIndex].publicKey,
      pk: this.publicKey,
    });
  };

  /**
   * send heartbeat message to other node in the network
   * @param guardIndex - index of guard in guardsInfo array
   * @protected
   */
  protected sendHeartbeatMessage = async (guardIndex: number) => {
    this.logger.debug(`Sending heartbeat message to ${guardIndex} guard`);
    const nonce = this.generateNonce();
    const payload: HeartbeatPayload = {
      nonce: nonce,
      timestamp: Date.now(),
    };
    this.guardsInfo[guardIndex].nonce = nonce;
    const payloadString = JSON.stringify(payload);
    await this.handler.send({
      type: heartbeatType,
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: this.guardsInfo[guardIndex].publicKey,
      pk: this.publicKey,
    });
  };

  protected sendSignMessage = async (
    guardIndex: number,
    signPayload: { payload: string; sign: string }
  ) => {
    this.logger.debug(`Sending sign message to ${guardIndex} guard`);
    const payload: SignPayload = {
      payload: signPayload.payload,
      sign: signPayload.sign,
      timestamp: Date.now(),
    };
    const payloadString = JSON.stringify(payload);
    await this.handler.send({
      type: signType,
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: this.guardsInfo[guardIndex].publicKey,
      pk: this.publicKey,
    });
  };

  protected sendRequestToSignMessage = async (
    guardIndex: number,
    requestToSignPayload: { payload: string; activeGuards: Array<ActiveGuard> }
  ) => {
    this.logger.debug(`Sending request to sign message to ${guardIndex} guard`);
    const payload: RequestToSignPayload = {
      payload: requestToSignPayload.payload,
      activeGuards: requestToSignPayload.activeGuards,
      timestamp: Date.now(),
    };
    const payloadString = JSON.stringify(payload);
    await this.handler.send({
      type: requestToSignType,
      payload: this.handler.encrypt(payloadString),
      signature: this.handler.sign(payloadString),
      receiver: this.guardsInfo[guardIndex].publicKey,
      pk: this.publicKey,
    });
  };

  protected isPayloadValidToSign(payload: string): boolean {
    return true;
  }

  protected handleRequestToSignMessage = async (
    message: RequestToSignPayload,
    senderPK: string
  ): Promise<void> => {
    const peerIds = message.activeGuards.map((guard) => guard.peerId);
    const senderActiveGuards = message.activeGuards.map(
      (guard) => guard.publicKey
    );
    const payload = message.payload;
    if (this.isPayloadValidToSign(payload)) {
      const myActiveGuards = this.getActiveGuards();
      const unCommonActiveGuards = myActiveGuards
        .filter((guard) => {
          !senderActiveGuards.includes(guard.publicKey);
        })
        .map((guard) => this.publicKeyToIndex(guard.publicKey));
      const registerResult = await this.registerAndWaitForApprove(
        unCommonActiveGuards,
        peerIds
      );
      if (registerResult) {
        const signedPayload = this.signTss(payload);
        const signPayload = {
          payload: payload,
          sign: signedPayload,
        };
        await this.sendSignMessage(
          this.publicKeyToIndex(senderPK),
          signPayload
        );
      }
    }
  };

  protected handleSignMessage = async (
    message: SignPayload,
    senderPk: string,
    sender: string
  ): Promise<void> => {
    const payload = message.payload;
    const sign = message.sign;
    if (this.checkTssSign(payload, sign, senderPk)) {
      this.logger.debug(`Sign message from ${sender} is valid`);
      const data = this.payloadToSignMap.get(payload);
      if (data) {
        if (data.active.includes(senderPk)) {
          data.signed.push({ publicKey: senderPk, sign: sign });
          this.payloadToSignMap.set(payload, data);
        }
        const timeToSign = this.timeRemindToSign();
        if (
          data.signed.length >= this.minimumSigner &&
          timeToSign.isTimeToSign &&
          timeToSign.timeRemained > minimumTimeRemainedToSign
        ) {
          this.broadcastSign(payload, data.signed);
          this.requestSignToTss(payload);
        }
      }
    }
  };

  protected broadcastSign = async (
    payload: string,
    publicKeySigns: Array<{ publicKey: string; sign: string }>
  ) => {
    publicKeySigns.forEach((obj) => {
      this.sendSignMessage(this.publicKeyToIndex(obj.publicKey), {
        payload: payload,
        sign: obj.sign,
      });
    });
  };

  protected requestSignToTss = async (payload: string) => {
    return;
  };
  protected blake2bHash = (message: string): Uint8Array => {
    return blake2b(message, undefined, 32);
  };
  protected signTss = (payload: string) => {
    const bytes = this.blake2bHash(payload);
    const signed = pkg.ecdsaSign(
      bytes,
      Uint8Array.from(Buffer.from(this.privateKey, 'hex'))
    );
    return Buffer.from(signed.signature).toString('hex');
  };

  protected checkTssSign = (
    payload: string,
    sign: string,
    publicKey: string
  ) => {
    const bytes = this.blake2bHash(payload);
    return pkg.ecdsaVerify(
      Uint8Array.from(Buffer.from(sign, 'hex')),
      Uint8Array.from(bytes),
      Uint8Array.from(Buffer.from(publicKey, 'hex'))
    );
  };
  protected registerAndWaitForApprove = async (
    guardsIndex: Array<number>,
    peerIds: Array<string>
  ) => {
    const timeToSign = this.timeRemindToSign();
    if (!timeToSign.isTimeToSign) return false;

    const registerPromises: Array<Promise<boolean>> = [];
    guardsIndex.forEach((value, index) => {
      const guardInfo = this.guardsInfo[value];
      registerPromises.push(this.register(peerIds[index], guardInfo.publicKey));
    });

    const delay = (millisecond: number): Promise<boolean> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(false);
        }, millisecond);
      });
    };

    const value = await Promise.race([
      Promise.all(registerPromises),
      Promise.all([delay(timeToSign.timeRemained)]),
    ]);

    return !value.includes(false);
  };

  protected signRequest = (payload: string) => {
    if (!this.payloadsToSignQueue.includes(payload))
      this.payloadsToSignQueue.push(payload);
  };

  /**
   * update guards status
   * if `guardHeartbeatTimeout` seconds passed by guard last update, a heartbeat should be sent
   * to the guard with a new nonce.
   * if `guardRegisterTimeout` seconds passed by guard last update, a register message should be sent
   * to the guard with a new nonce.
   * @protected
   */
  protected updateGuardsStatus = async () => {
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
      if (e instanceof Error && e.stack) {
        this.logger.warn(e.stack);
      }
    }
    this.signProcedure();
  };

  /**
   * Register new guard to the class
   * @param peerId
   * @param publicKey
   */
  public register = async (
    peerId: string,
    publicKey: string
  ): Promise<boolean> => {
    const guardIndex = this.publicKeyToIndex(publicKey);
    if (guardIndex === -1) {
      throw new Error('Guard not found');
    }
    const guard = this.guardsInfo[guardIndex];
    if (guard.peerId === '') {
      try {
        const promise: Promise<boolean> = new Promise((resolve, reject) => {
          guard.recognitionPromises.push(resolve);
        });
        await this.sendRegisterMessage(guardIndex);
        this.logger.debug(`Guard ${guardIndex} registered`);
        return promise;
      } catch (e) {
        this.logger.warn(`An Error occurred while registering guard: ${e}`);
        if (e instanceof Error && e.stack) {
          this.logger.warn(e.stack);
        }
        return Promise.reject(new Error('Error while registering guard'));
      }
    } else {
      if (this.guardsInfo[guardIndex].peerId !== peerId) {
        return Promise.reject(new Error('PeerId is not the same'));
      } else if (!this.isGuardActive(guardIndex)) {
        try {
          const promise: Promise<boolean> = new Promise((resolve, reject) => {
            guard.recognitionPromises.push(resolve);
          });
          await this.sendHeartbeatMessage(guardIndex);
          return promise;
        } catch (e) {
          this.logger.warn(
            `An Error occurred while registering registered guard: ${e}`
          );
          if (e instanceof Error && e.stack) {
            this.logger.warn(e.stack);
          }
          return Promise.reject(new Error('Error while registering guard'));
        }
      } else {
        return Promise.resolve(true);
      }
    }
  };

  /**
   * Checks if guard is active or not by checking the last update time is
   * less than `guardsRegisterTimeout`
   * @param guardIndex
   * @protected
   */
  protected isGuardActive = (guardIndex: number): boolean => {
    const currentTime = Date.now();
    return (
      this.guardsInfo[guardIndex].peerId !== '' &&
      currentTime - this.guardsInfo[guardIndex].lastUpdate <
        this.guardsRegisterTimeout
    );
  };

  /**
   * get active guards publicKey and peerId
   * @public
   * @returns array of guards publicKey and peerIds
   */
  public getActiveGuards = (): ActiveGuard[] => {
    return this.guardsInfo
      .map((guard, index) => ({ ...guard, index }))
      .filter((guard) => {
        return this.isGuardActive(guard.index);
      })
      .map((guard) => {
        return { peerId: guard.peerId, publicKey: guard.publicKey };
      });
  };

  protected signProcedure = () => {
    if (!this.timeRemindToSign().isTimeToSign) {
      return;
    }
    const activeGuards = this.getActiveGuards();
    if (this.payloadsToSignQueue.length === 0) {
      return;
    }
    if (activeGuards.length < this.minimumSigner) {
      return;
    }
    const sentPayloads: Array<number> = [];
    for (let i = 0; i < this.payloadsToSignQueue.length; i++) {
      try {
        activeGuards.forEach((guard) => {
          this.sendRequestToSignMessage(
            this.publicKeyToIndex(guard.publicKey),
            {
              payload: this.payloadsToSignQueue[i],
              activeGuards: activeGuards,
            }
          );
        });
        sentPayloads.push(i);
      } catch (e) {
        this.logger.warn(`An Error occurred while sending sign request: ${e}`);
      }
    }
    this.payloadsToSignQueue = this.payloadsToSignQueue.filter(
      (payload, index) => !sentPayloads.includes(index)
    );
  };

  protected timeRemindToSign = () => {
    const currentTime = Date.now();
    const currentTimeMinute = Math.floor(currentTime / oneMinute);
    const reminder = currentTimeMinute % (this.guardsInfo.length + 1);
    const timeRemained = (currentTimeMinute + 1) * oneMinute - currentTime;
    return {
      isTimeToSign: reminder === this.index,
      timeRemained: timeRemained,
    };
  };
}

export { GuardDetection };
