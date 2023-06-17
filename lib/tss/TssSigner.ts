import { Communicator } from '../abstract';
import {
  SignApprovePayload,
  PendingSign,
  SignRequestPayload,
  Sign,
  Signature,
  SignerConfig,
  SignMessageType,
  SignStartPayload,
} from '../types/signer';
import { GuardDetection } from '../detection/GuardDetection';
import {
  defaultTimeoutDefault,
  signTurnDurationDefault,
  signTurnNoWorkDefault,
} from '../const/const';
import { requestMessage, approveMessage, startMessage } from '../const/signer';
import { ActiveGuard } from '../types/abstract';
import { DummyLogger } from '@rosen-bridge/logger-interface';
import { Mutex } from 'await-semaphore';
import axios from 'axios';

export class TssSigner extends Communicator {
  private readonly tssSignUrl: string;
  private readonly callbackUrl: string;
  private readonly threshold: number;
  private readonly turnDuration: number;
  private readonly turnNoWork: number;
  private readonly timeout: number;
  private lastUpdateRound: number;
  private signs: Array<Sign>;
  private pendingSigns: Array<PendingSign>;
  private readonly detection: GuardDetection;
  private readonly getPeerId: () => Promise<string>;
  private readonly pendingAccessMutex: Mutex;
  private readonly signAccessMutex: Mutex;

  constructor(config: SignerConfig) {
    super(
      config.logger ? config.logger : new DummyLogger(),
      config.signer,
      config.submitMsg,
      config.guardsPk,
      config.messageValidDuration
    );
    this.tssSignUrl = config.tssSignUrl;
    this.callbackUrl = config.callbackUrl;
    this.detection = config.detection;
    this.turnDuration = config.turnDurationSeconds
      ? config.turnDurationSeconds
      : signTurnDurationDefault;
    this.turnNoWork = config.turnNoWorkSeconds
      ? config.turnNoWorkSeconds
      : signTurnNoWorkDefault;
    this.threshold = config.threshold;
    this.lastUpdateRound = 0;
    this.timeout = config.timeoutSeconds
      ? config.timeoutSeconds
      : defaultTimeoutDefault;
    this.getPeerId = config.getPeerId;
    this.signs = [];
    this.pendingSigns = [];
    this.pendingAccessMutex = new Mutex();
    this.signAccessMutex = new Mutex();
  }

  protected cleanup = async () => {
    const timeout = this.getDate() - this.timeout;
    const turn = this.getGuardTurn();
    const releaseSign = await this.signAccessMutex.acquire();
    this.signs = this.signs.filter((sign) => sign.addedTime > timeout);
    releaseSign();
    const releasePending = await this.pendingAccessMutex.acquire();
    this.pendingSigns = this.pendingSigns.filter(
      (pending) => pending.index === turn
    );
    releasePending();
  };

  update = async () => {
    await this.cleanup();
    if ((await this.getIndex()) !== this.getGuardTurn()) {
      return;
    }
    const activeGuards = await this.detection.activeGuards();
    if (activeGuards.length < this.threshold) {
      return;
    }
    const timestamp = this.getDate();
    const round = Math.floor(timestamp / this.turnDuration);
    if (round !== this.lastUpdateRound) {
      this.lastUpdateRound = round;
      for (const sign of this.signs) {
        const payload: SignRequestPayload = {
          msg: sign.msg,
          guards: activeGuards,
        };
        await this.sendMessage(requestMessage, payload, [], timestamp);
        const release = await this.signAccessMutex.acquire();
        sign.request = {
          guards: [...activeGuards],
          index: await this.getIndex(),
          timestamp,
        };
        sign.signs = Array(this.guardPks.length).fill('');
        sign.signs[await this.getIndex()] = await this.signPayload(
          {
            msg: sign.msg,
            guards: activeGuards,
            initGuardIndex: await this.getIndex(),
          },
          timestamp
        );
        release();
      }
    }
  };

  getGuardTurn = () => {
    const currentTime = this.getDate();
    return Math.floor(currentTime / this.turnDuration) % this.guardPks.length;
  };

  protected isNoWorkTime = () => {
    const currentTime = this.getDate();
    const round = Math.floor(currentTime / this.turnDuration);
    return (round + 1) * this.turnDuration - currentTime <= this.turnNoWork;
  };

  sign = async (
    msg: string,
    callback: (status: boolean, message?: string, args?: Signature) => unknown
  ) => {
    if (this.getSign(msg)) {
      throw Error('already signing this message');
    }
    const release = await this.signAccessMutex.acquire();
    this.signs.push({ msg, callback, signs: [], addedTime: this.getDate() });
    release();
    const pending = this.getPendingSign(msg);
    if (pending) {
      await this.handleRequestMessage(
        { msg: msg, guards: pending.guards },
        pending.sender,
        pending.index,
        pending.timestamp
      );
    }
  };

  signPromised = (message: string): Promise<Signature> => {
    return new Promise<Signature>((resolve, reject) => {
      this.sign(
        message,
        (status: boolean, message?: string, args?: Signature) => {
          if (status && args) resolve(args);
          reject(message);
        }
      ).then(() => null);
    });
  };

  processMessage = (
    type: string,
    payload: unknown,
    sign: string,
    senderIndex: number,
    peerId: string,
    timestamp: number
  ) => {
    switch (type as SignMessageType) {
      case requestMessage:
        return this.handleRequestMessage(
          payload as SignRequestPayload,
          peerId,
          senderIndex,
          timestamp
        );
      case approveMessage:
        return this.handleApproveMessage(
          payload as SignApprovePayload,
          peerId,
          senderIndex,
          sign
        );
      case startMessage:
        return this.handleStartMessage(
          payload as SignStartPayload,
          timestamp,
          senderIndex,
          peerId
        );
    }
    this.logger.warn(`invalid message type ${type} arrived`);
  };

  protected getUnknownGuards = async (guards: Array<ActiveGuard>) => {
    const myActiveGuards = await this.detection.activeGuards();
    return guards.filter((guard) => {
      return (
        myActiveGuards.filter((item) => item.publicKey === guard.publicKey)
          .length === 0
      );
    });
  };

  protected getInvalidGuards = async (guards: Array<ActiveGuard>) => {
    const myActiveGuards = await this.detection.activeGuards();
    return guards.filter((guard) => {
      return (
        myActiveGuards.filter(
          (item) =>
            item.publicKey === guard.publicKey && item.peerId !== guard.peerId
        ).length > 0
      );
    });
  };

  protected handleRequestMessage = async (
    payload: SignRequestPayload,
    sender: string,
    guardIndex: number,
    timestamp: number,
    sendRegister = true
  ) => {
    if (this.getGuardTurn() !== guardIndex) {
      if (sendRegister)
        this.logger.warn(
          `Got a request to sign message from ${sender} but Its not its turn`
        );
      return;
    }
    if ((await this.getInvalidGuards(payload.guards)).length > 0) {
      if (sendRegister)
        this.logger.warn(`Invalid guard set passed to sign from ${sender}`);
      return;
    }
    const sign = this.getSign(payload.msg);
    if (sign) {
      const unknown = await this.getUnknownGuards(payload.guards);
      if (sendRegister) {
        for (const guard of unknown) {
          await this.detection.register(
            guard.peerId,
            guard.publicKey,
            (status, message) => {
              if (status) {
                this.handleRequestMessage(
                  payload,
                  sender,
                  guardIndex,
                  timestamp,
                  false
                );
              } else {
                this.logger.warn(
                  `Can not register guard ${guard.publicKey} with peer Id ${guard.peerId}: ${message}`
                );
              }
            }
          );
        }
      }
      if (unknown.length === 0) {
        const responsePayload: SignApprovePayload = {
          msg: payload.msg,
          guards: payload.guards,
          initGuardIndex: guardIndex,
        };
        await this.sendMessage(
          approveMessage,
          responsePayload,
          [sender],
          timestamp
        );
      }
    } else {
      const pending = this.getPendingSign(payload.msg);
      const release = await this.pendingAccessMutex.acquire();
      if (pending) {
        pending.guards = payload.guards;
        pending.index = guardIndex;
        pending.timestamp = timestamp;
        pending.sender = sender;
      } else {
        this.pendingSigns.push({
          msg: payload.msg,
          index: guardIndex,
          guards: payload.guards,
          timestamp,
          sender,
        });
      }
      release();
    }
  };

  protected getSign = (msg: string) => {
    const filtered = this.signs.filter((item) => item.msg === msg);
    if (filtered.length === 0) {
      return undefined;
    }
    return filtered[0];
  };

  protected getPendingSign = (msg: string) => {
    const filtered = this.pendingSigns.filter((item) => item.msg === msg);
    if (filtered.length === 0) {
      return undefined;
    }
    return filtered[0];
  };

  protected handleApproveMessage = async (
    payload: SignApprovePayload,
    sender: string,
    guardIndex: number,
    signature: string
  ) => {
    const sign = this.getSign(payload.msg);
    if (!sign) {
      this.logger.warn(
        `approve message arrived but signing message not found ${payload.msg}`
      );
      return;
    }
    const myPk = await this.signer.getPk();

    if (sign.request && !this.isNoWorkTime()) {
      sign.signs[guardIndex] = signature;
      if (sign.signs.filter((item) => item !== '').length >= this.threshold) {
        const payload: SignStartPayload = {
          msg: sign.msg,
          signs: sign.signs,
          guards: sign.request.guards,
        };
        await this.sendMessage(
          startMessage,
          payload,
          sign.request.guards
            .filter((item) => item.publicKey !== myPk)
            .map((item) => item.peerId),
          sign.request.timestamp
        );
        await this.startSign(sign.msg, sign.request.guards);
      }
    }
  };

  protected handleStartMessage = async (
    payload: SignStartPayload,
    timestamp: number,
    guardIndex: number,
    sender: string
  ) => {
    const sign = this.getSign(payload.msg);
    if (!sign) {
      this.logger.warn(
        `start sign message arrived but signing message not found ${payload.msg}`
      );
      return;
    }
    if (this.getGuardTurn() !== guardIndex) {
      this.logger.warn(
        `Got a request to sign message from ${sender} but Its not its turn`
      );
      return;
    }
    const payloadToSign: SignApprovePayload = {
      msg: payload.msg,
      guards: payload.guards,
      initGuardIndex: guardIndex,
    };
    const myPk = await this.signer.getPk();
    if (payload.guards.filter((item) => item.publicKey === myPk).length == 0) {
      this.logger.warn(
        `Got a request to sign message from ${sender} but I'm not involved`
      );
      return;
    }
    const validSigns = (
      await Promise.all(
        payload.signs.map(
          async (item, index) =>
            item !== '' &&
            payload.guards.filter(
              (item) => item.publicKey === this.guardPks[index]
            ) &&
            (await this.signer.verify(
              TssSigner.generatePayloadToSign(
                payloadToSign,
                timestamp,
                this.guardPks[index]
              ),
              item,
              this.guardPks[index]
            ))
        )
      )
    ).filter((item) => item);
    if (validSigns.length >= this.threshold) {
      await this.startSign(payload.msg, payload.guards);
    }
  };

  startSign = (message: string, guards: Array<ActiveGuard>) => {
    return axios
      .post(this.tssSignUrl, {
        peers: guards.map((item) => ({
          shareId: item.publicKey,
          p2pId: item.peerId,
        })),
        message: message,
        crypto: 'eddsa', // TODO must fix it
        callBackUrl: this.callbackUrl,
      })
      .catch((err) => {
        const sign = this.getSign(message);
        if (sign && sign.callback) {
          sign.callback(false, err);
        }
      });
  };

  handleSignData = () => {
    console.log('sign data arrived');
  };
}
