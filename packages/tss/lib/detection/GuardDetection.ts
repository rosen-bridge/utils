import { Communicator } from '../abstract/Comunicator';
import { randomBytes } from 'crypto';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import {
  ApprovePayload,
  GuardDetectionConfig,
  GuardInfo,
  HeartbeatPayload,
  MessageType,
  Nonce,
  RegisterPayload,
} from '../types/detection';
import {
  guardHeartbeatTimeoutDefault,
  guardActiveTimeoutDefault,
  approveMessage,
  heartbeatMessage,
  registerMessage,
} from '../const/const';
import { ActiveGuard } from '../types/abstract';

export class GuardDetection extends Communicator {
  protected guardsInfo: Array<GuardInfo> = [];
  protected readonly activeTimeout: number;
  protected readonly heartbeatTimeout: number;

  constructor(config: GuardDetectionConfig) {
    super(
      config.logger ? config.logger : new DummyLogger(),
      config.signer,
      config.submit,
      config.guardsPublicKey,
      config.messageValidDurationSeconds
    );
    this.activeTimeout =
      (config.activeTimeoutSeconds || guardActiveTimeoutDefault) * 1000;
    this.heartbeatTimeout =
      (config.heartbeatTimeoutSeconds || guardHeartbeatTimeoutDefault) * 1000;
    this.guardsInfo = config.guardsPublicKey.map((item) => ({
      peerId: '',
      nonce: [],
      lastUpdate: 0,
      publicKey: item,
      callback: [],
    }));
  }

  protected addNonce = (index?: number) => {
    this.clearNonce();
    const nonce = new Nonce();
    if (index) {
      const info = this.guardsInfo[index];
      info.nonce.push(nonce);
    } else {
      this.guardsInfo.forEach((info) => info.nonce.push(nonce));
    }
    return nonce.bytes;
  };

  protected clearNonce = () => {
    const cleanupTime = Date.now() - this.messageValidDuration;
    this.guardsInfo.forEach((info) => {
      const index = info.nonce.findIndex(
        (nonce) => nonce.timestamp > cleanupTime
      );
      info.nonce.splice(0, index === -1 ? info.nonce.length : index);
    });
  };

  /**
   * Initialize the guard detection
   * @returns
   */
  init = async (): Promise<void> => {
    const nonce = this.addNonce();
    await this.sendMessage(registerMessage, { nonce }, []);
    this.clearNonce();
  };

  /**
   * send heartbeat to all guards if required.
   * if more than half of guards are inactive send register message
   */
  update = async (): Promise<void> => {
    if (this.activeGuards().length < this.guardsInfo.length / 2) {
      await this.init();
    } else {
      const timedOutInfo = this.guardsInfo.filter(
        (item) =>
          item.peerId !== '' &&
          item.lastUpdate < Date.now() - this.heartbeatTimeout
      );
      for (const item of timedOutInfo) {
        const nonce = new Nonce();
        await this.sendMessage(
          heartbeatMessage,
          { nonce: nonce, timestamp: Date.now() },
          [item.peerId]
        );
        item.nonce.push(nonce);
      }
      this.clearNonce();
    }
  };

  /**
   * handle receive message according to message type
   * @public
   * @param type
   * @param payload
   * @param senderIndex
   * @param peerId
   */
  processMessage = async (
    type: string,
    payload: unknown,
    senderIndex: number,
    peerId: string
  ): Promise<void> => {
    switch (type as MessageType) {
      case approveMessage:
        await this.handleApproveMessage(
          payload as ApprovePayload,
          peerId,
          senderIndex
        );
        return;
      case heartbeatMessage:
        await this.handleHeartbeatMessage(
          payload as HeartbeatPayload,
          peerId,
          senderIndex
        );
        return;
      case registerMessage:
        await this.handleRegisterMessage(
          payload as RegisterPayload,
          peerId,
          senderIndex
        );
        return;
    }
  };

  /**
   * handle Register message from other node in the network and send approval
   * message with new nonce
   * @param registerPayload - RegisterPayload
   * @param sender - public key of sender
   * @param guardIndex
   * @protected
   */
  protected handleRegisterMessage = async (
    registerPayload: RegisterPayload,
    sender: string,
    guardIndex: number
  ): Promise<void> => {
    try {
      const receivedNonce = registerPayload.nonce;
      const nonce = this.addNonce(guardIndex);
      await this.sendMessage(
        approveMessage,
        {
          nonce: nonce,
          receivedNonce: receivedNonce,
        },
        [sender]
      );
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
   * @param guardIndex
   * @protected
   */
  protected handleApproveMessage = async (
    approvePayload: ApprovePayload,
    sender: string,
    guardIndex: number
  ): Promise<void> => {
    try {
      const receivedNonce = approvePayload.receivedNonce;
      const nonce = approvePayload.nonce;
      const guard = this.guardsInfo[guardIndex];
      this.clearNonce();
      if (
        guard.nonce.filter((nonce) => nonce.bytes === receivedNonce).length > 0
      ) {
        guard.peerId = sender;
        guard.lastUpdate = Date.now();
        guard.callback.forEach((resolve) => resolve(true));
        guard.callback = [];
        guard.nonce.splice(0, guard.nonce.length);
        if (nonce) {
          const payload: ApprovePayload = {
            receivedNonce: nonce,
          };
          await this.sendMessage(approveMessage, payload, [sender]);
          this.logger.debug(
            `Sent approval to register message guard with index [${guardIndex}]`
          );
        }
      } else {
        this.logger.warn(
          `Received nonce from guard with index [${guardIndex}] is not valid`
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
   * @param guardIndex
   * @protected
   */
  protected handleHeartbeatMessage = async (
    heartbeatPayload: HeartbeatPayload,
    sender: string,
    guardIndex: number
  ): Promise<void> => {
    try {
      const nonce = heartbeatPayload.nonce;
      const payload: ApprovePayload = {
        receivedNonce: nonce,
      };
      await this.sendMessage(approveMessage, payload, [sender]);
      this.logger.debug(
        `Sent approval message to heartbeat message guard with index [${guardIndex}]`
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
   * Checks if guard is active or not by checking the last update time is
   * less than `guardsRegisterTimeout`
   * @param guardIndex
   * @protected
   */
  protected isGuardActive = (guardIndex: number) => {
    const currentTime = Date.now();
    return (
      this.guardsInfo[guardIndex].peerId !== '' &&
      currentTime - this.guardsInfo[guardIndex].lastUpdate < this.activeTimeout
    );
  };

  /**
   * get active guards publicKey and peerId
   * @public
   * @returns array of guards publicKey and peerIds
   */
  activeGuards = (): Array<ActiveGuard> => {
    return this.guardsInfo
      .filter((item, index) => this.isGuardActive(index))
      .map((item) => ({
        peerId: item.peerId,
        publicKey: item.publicKey,
      }));
  };

  /**
   * Register new guard to the class
   * @param peerId
   * @param publicKey
   * @param callback
   */
  register = async (
    peerId: string,
    publicKey: string,
    callback: (status: boolean, message?: string) => unknown
  ) => {
    const guardIndex = this.guardPks.indexOf(publicKey);
    if (guardIndex === -1) {
      callback(false, 'Guard not found');
      return;
    }
    const guard = this.guardsInfo[guardIndex];
    if (guard.peerId === '' || !this.isGuardActive(guardIndex)) {
      try {
        guard.callback.push(callback);
        const nonce = new Nonce();
        guard.nonce.push(nonce);
        await this.sendMessage(registerMessage, { nonce: nonce.bytes }, [
          peerId,
        ]);
        this.clearNonce();
      } catch (e) {
        this.logger.warn(`An Error occurred while registering guard: ${e}`);
        if (e instanceof Error && e.stack) {
          this.logger.warn(e.stack);
        }
        callback(false, 'Error while registering guard');
      }
    } else {
      if (this.guardsInfo[guardIndex].peerId !== peerId) {
        callback(false, 'PeerId is not the same');
      } else {
        callback(true);
      }
    }
  };

  /**
   * Register new guard to the class returning promise
   * @param peerId
   * @param publicKey
   */
  registerPromised = async (
    peerId: string,
    publicKey: string
  ): Promise<boolean> => {
    return new Promise<boolean>((resolve, reject) => {
      this.register(peerId, publicKey, (status: boolean, reason?: string) => {
        if (status) resolve(true);
        reject(new Error(reason));
      }).then(() => null);
    });
  };
}
