import { Communicator } from '../abstract';
import {
  Threshold,
  PendingSign,
  Sign,
  SignApprovePayload,
  SignerConfig,
  SignMessageType,
  SignRequestPayload,
  SignStartPayload,
  StatusEnum,
  Crypto,
} from '../types/signer';
import { GuardDetection } from '../detection/GuardDetection';
import {
  defaultThresholdTTL,
  defaultTimeoutDefault,
  signTurnDurationDefault,
  signTurnNoWorkDefault,
} from '../const/const';
import {
  approveMessage,
  requestMessage,
  signUrl,
  startMessage,
  thresholdUrl,
} from '../const/signer';
import { ActiveGuard } from '../types/abstract';
import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { Mutex } from 'await-semaphore';
import axios, { AxiosInstance } from 'axios';

export class TssSigner extends Communicator {
  private readonly axios: AxiosInstance;
  private readonly callbackUrl: string;
  private threshold: Threshold;
  private readonly thresholdTTL: number;
  private readonly turnDuration: number;
  private readonly turnNoWork: number;
  private readonly timeout: number;
  private readonly responseDelay: number;
  private lastUpdateRound: number;
  protected signs: Array<Sign>;
  protected pendingSigns: Array<PendingSign>;
  private readonly detection: GuardDetection;
  private readonly getPeerId: () => Promise<string>;
  private readonly pendingAccessMutex: Mutex;
  private readonly signAccessMutex: Mutex;
  private readonly shares: Array<string>;
  private readonly signPerRoundLimit: number;

  /**
   * get threshold value from tss-api instance if threshold didn't set or expired and set for this and detection
   * this function calls on every update
   * @param crypto ecdsa or eddsa
   */
  protected updateThreshold = async (crypto: Crypto) => {
    try {
      if (this.threshold.expiry < Date.now()) {
        const res = await this.axios.get<{ threshold: number }>(thresholdUrl, {
          params: { crypto },
        });
        const threshold = res.data.threshold + 1;
        this.detection.setNeedGuardThreshold(threshold);
        this.threshold = {
          expiry: Date.now() + this.thresholdTTL,
          value: threshold,
        };
      }
    } catch (error) {
      this.logger.warn(
        `an error occurred when try getting threshold from tss ${error}`
      );
      if (error instanceof Error && error.stack) {
        this.logger.warn(error.stack);
      }
    }
  };

  constructor(config: SignerConfig) {
    super(
      config.logger ? config.logger : new DummyLogger(),
      config.signer,
      config.submitMsg,
      config.guardsPk,
      config.messageValidDuration
    );
    this.axios = axios.create({
      baseURL: config.tssApiUrl,
    });
    this.callbackUrl = config.callbackUrl;
    this.detection = config.detection;
    this.turnDuration = config.turnDurationSeconds
      ? config.turnDurationSeconds
      : signTurnDurationDefault;
    this.turnNoWork = config.turnNoWorkSeconds
      ? config.turnNoWorkSeconds
      : signTurnNoWorkDefault;
    this.threshold = {
      expiry: 0,
      value: -1,
    };
    this.lastUpdateRound = 0;
    this.timeout = config.timeoutSeconds
      ? config.timeoutSeconds
      : defaultTimeoutDefault;
    this.thresholdTTL = config.thresholdTTL
      ? config.thresholdTTL
      : defaultThresholdTTL;
    this.getPeerId = config.getPeerId;
    this.shares = config.shares;
    this.signs = [];
    this.pendingSigns = [];
    this.pendingAccessMutex = new Mutex();
    this.signAccessMutex = new Mutex();
    this.responseDelay = config.responseDelay ?? 5;
    this.signPerRoundLimit = config.signPerRoundLimit ?? 2;
  }

  /**
   * cleanup all timed out signatures
   */
  protected cleanup = async () => {
    this.logger.debug('try cleaning timed out signs');
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

  /**
   * update signing process for all signatures.
   * check if this guards turn
   * and founded guards are enough
   * run start message for all signs
   */
  update = async () => {
    await this.cleanup();
    if ((await this.getIndex()) !== this.getGuardTurn()) {
      return;
    }
    if (this.signs.length === 0) return;
    await this.updateThreshold(this.signs[0].crypto);
    const activeGuards = await this.detection.activeGuards();
    if (activeGuards.length < this.threshold.value) {
      return;
    }
    const timestamp = this.getDate();
    const round = Math.floor(timestamp / this.turnDuration);
    if (round !== this.lastUpdateRound) {
      this.lastUpdateRound = round;
      this.logger.debug('processing signs to start');
      for (const sign of this.signs.slice(0, this.signPerRoundLimit)) {
        if (sign.posted) continue;
        this.logger.debug(`new sign found with [${sign.msg}]`);
        const payload: SignRequestPayload = {
          msg: sign.msg,
          guards: activeGuards,
          crypto: sign.crypto,
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

  /**
   * check if this guard turn
   */
  getGuardTurn = () => {
    const currentTime = this.getDate();
    return Math.floor(currentTime / this.turnDuration) % this.guardPks.length;
  };

  /**
   * check if we are in last seconds of round or not
   */
  protected isNoWorkTime = () => {
    const currentTime = this.getDate();
    const round = Math.floor(currentTime / this.turnDuration);
    return (round + 1) * this.turnDuration - currentTime <= this.turnNoWork;
  };

  /**
   * add new sign to queue
   * if other guards proceed this sign we also process it
   * @param msg
   * @param crypto ecdsa or eddsa
   * @param callback
   */
  sign = async (
    msg: string,
    crypto: Crypto,
    callback: (status: boolean, message?: string, args?: string) => unknown
  ) => {
    if (this.getSign(msg, true)) {
      throw Error('already signing this message');
    }
    const release = await this.signAccessMutex.acquire();
    this.logger.info(`adding new message [${msg}] to signing queue`);
    this.signs.push({
      msg,
      callback,
      signs: [],
      addedTime: this.getDate(),
      posted: false,
      crypto,
    });
    release();

    const pending = this.getPendingSign(msg);
    if (pending) {
      this.logger.info(
        `processing pending request for [${msg}] from other guards`
      );
      await this.handleRequestMessage(
        { msg: msg, guards: pending.guards, crypto },
        pending.sender,
        pending.index,
        pending.timestamp
      );
    }
  };

  /**
   * sign message and return promise
   * @param message
   * @param crypto
   */
  signPromised = (message: string, crypto: Crypto): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      this.sign(
        message,
        crypto,
        (status: boolean, message?: string, args?: string) => {
          if (status && args) resolve(args);
          reject(message);
        }
      )
        .then(() => null)
        .catch((e) => reject(e));
    });
  };

  /**
   * process new message
   * @param messageType
   * @param payload
   * @param sign
   * @param senderIndex
   * @param peerId
   * @param timestamp
   */
  processMessage = (
    messageType: string,
    payload: unknown,
    sign: string,
    senderIndex: number,
    peerId: string,
    timestamp: number
  ) => {
    switch (messageType as SignMessageType) {
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
    this.logger.warn(`invalid message type [${messageType}] arrived`);
  };

  /**
   * get a list of guards and return unknown guards info from selected list
   * @param guards
   */
  protected getUnknownGuards = async (guards: Array<ActiveGuard>) => {
    const myActiveGuards = await this.detection.activeGuards();
    return guards.filter((guard) => {
      return (
        myActiveGuards.filter((item) => item.publicKey === guard.publicKey)
          .length === 0
      );
    });
  };

  /**
   * get a list of guards and return a list of invalid guards
   * one guard is invalid if p2pId of detected guard differ from selected guard in list
   * @param guards
   */
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

  /**
   * handle sign request message. verify guard turn and message
   * then return approve message
   * @param payload
   * @param sender
   * @param guardIndex
   * @param timestamp
   * @param sendRegister
   */
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
          `Got a request to sign message from [${sender}] but its not his turn`
        );
      return;
    }
    if ((await this.getInvalidGuards(payload.guards)).length > 0) {
      if (sendRegister)
        this.logger.warn(`Invalid guard set passed to sign from [${sender}]`);
      return;
    }
    const sign = this.getSign(payload.msg);
    if (sign) {
      const unknown = await this.getUnknownGuards(payload.guards);
      this.logger.debug(
        `unknown guards found in signing request ${JSON.stringify(unknown)}`
      );
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
                  `Can not register guard [${guard.publicKey}] with peer Id [${guard.peerId}]: ${message}`
                );
              }
            }
          );
        }
      }
      if (unknown.length === 0) {
        this.logger.info(
          `signing request for message [${sign.msg}] approved. sending approval message`
        );
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
      this.logger.info(
        `new signing message arrived [${payload.msg}] but not in signing queue yet. store it for future use`
      );
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
          crypto: payload.crypto,
        });
      }
      release();
    }
  };

  /**
   * find a signing message in sign queue.
   * @param msg
   * @param searchPosted: if true search all element.
   *    otherwise only search in element which does not post to tss backend
   */
  protected getSign = (msg: string, searchPosted = false) => {
    const filtered = this.signs.filter((item) => item.msg === msg);
    if (filtered.length === 0) {
      return undefined;
    }
    if (!filtered[0].posted || searchPosted) {
      return filtered[0];
    }
    return undefined;
  };

  /**
   * get a message in list of pending signature.
   * @param msg
   */
  protected getPendingSign = (msg: string) => {
    const filtered = this.pendingSigns.filter((item) => item.msg === msg);
    if (filtered.length === 0) {
      return undefined;
    }
    return filtered[0];
  };

  /**
   * handle signing approve message.
   * collect signatures and if required count of signatures are arrived start signing process
   * ignore signing process if in NoWorkTime
   * @param payload
   * @param sender
   * @param guardIndex
   * @param signature
   */
  protected handleApproveMessage = async (
    payload: SignApprovePayload,
    sender: string,
    guardIndex: number,
    signature: string
  ) => {
    const sign = this.getSign(payload.msg);
    if (!sign) {
      this.logger.warn(
        `approve message arrived but signing message not found [${payload.msg}]`
      );
      return;
    }
    const myPk = await this.signer.getPk();

    if (sign.request && !this.isNoWorkTime()) {
      return await this.signAccessMutex.acquire().then(async (release) => {
        try {
          sign.signs[guardIndex] = signature;
          const approvedGuards = await this.getApprovedGuards(
            sign.request!.timestamp,
            {
              msg: sign.msg,
              guards: sign.request!.guards,
              initGuardIndex: await this.getIndex(),
            },
            sign.signs
          );
          if (approvedGuards.length >= this.threshold.value) {
            if (this.getSign(payload.msg)) {
              const payload: SignStartPayload = {
                msg: sign.msg,
                signs: sign.signs,
                guards: sign.request!.guards,
              };
              await this.sendMessage(
                startMessage,
                payload,
                approvedGuards
                  .filter((item) => item.publicKey !== myPk)
                  .map((item) => item.peerId),
                sign.request!.timestamp
              );
              await this.startSign(sign.msg, approvedGuards);
            }
          } else {
            this.logger.debug(
              `[${approvedGuards.length}] out of required [${this.threshold.value}] guards approved message [${sign.msg}]. Signs are: ${sign.signs}`
            );
          }
        } catch (e) {
          this.logger.warn(
            `an error occurred while handling approve message: ${e}`
          );
        }
        release();
      });
    } else {
      this.logger.debug(
        'new message arrived but current guard is in no-work-period'
      );
    }
  };

  /**
   * handle start sign message.
   * process all signatures in message and if all verified start signing process with selected list of guards
   * @param payload
   * @param timestamp
   * @param guardIndex
   * @param sender
   */
  protected handleStartMessage = async (
    payload: SignStartPayload,
    timestamp: number,
    guardIndex: number,
    sender: string
  ) => {
    const sign = this.getSign(payload.msg);
    if (!sign) {
      this.logger.warn(
        `start sign message arrived but signing message not found [${payload.msg}]`
      );
      return;
    }
    if (this.getGuardTurn() !== guardIndex) {
      this.logger.warn(
        `Got a request to sign message from [${sender}] but its not his turn`
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
        `Got a request to sign message from [${sender}] but I'm not involved`
      );
      return;
    }
    const approvedGuards = await this.getApprovedGuards(
      timestamp,
      payloadToSign,
      payload.signs
    );
    if (approvedGuards.length >= this.threshold.value) {
      await this.signAccessMutex.acquire().then(async (release) => {
        await this.startSign(sign.msg, approvedGuards);
        release();
      });
    }
  };

  /**
   * process list of selected guards and list of signs
   * then return list of all approved guards
   * @param timestamp
   * @param payload
   * @param signs
   */
  protected getApprovedGuards = async (
    timestamp: number,
    payload: SignApprovePayload,
    signs: Array<string>
  ): Promise<Array<ActiveGuard>> => {
    return (
      await Promise.all(
        payload.guards.map(async (guard) => {
          const index = this.guardPks.indexOf(guard.publicKey);
          if (index === -1) return undefined;
          const sign = signs[index];
          if (sign === '') return undefined;
          const verifiedSign = await this.signer.verify(
            TssSigner.generatePayloadToSign(
              payload,
              timestamp,
              guard.publicKey
            ),
            sign,
            guard.publicKey
          );
          return verifiedSign ? guard : undefined;
        })
      )
    ).filter((item) => item !== undefined) as Array<ActiveGuard>;
  };

  /**
   * start signing process for specific message
   * @param message
   * @param guards
   */
  startSign = (message: string, guards: Array<ActiveGuard>) => {
    const sign = this.getSign(message);
    if (sign) {
      sign.posted = true;
      const remainingTime = this.timeout - (this.getDate() - sign.addedTime);
      const data = {
        peers: guards.map((item) => ({
          shareID: this.shares[this.guardPks.indexOf(item.publicKey)],
          p2pID: item.peerId,
        })),
        message: message,
        crypto: this.signer.getCrypto(),
        operationTimeout: remainingTime - this.responseDelay,
        callBackUrl: this.callbackUrl,
      };
      return this.axios.post(signUrl, data).catch((err) => {
        this.logger.warn('Can not communicate with tss backend');
        this.logger.debug(err.stack);
        if (sign.callback) {
          this.signAccessMutex.acquire().then((release) => {
            sign.callback(false, err.status_code);
            this.signs = this.signs.filter((item) => item.msg !== sign.msg);
            release();
          });
        }
      });
    }
  };

  /**
   * handle signing data callback for a message and process callback function
   * @param status
   * @param message
   * @param signature
   * @param signatureRecovery
   * @param error
   */
  handleSignData = (
    status: StatusEnum,
    message: string,
    signature?: string,
    signatureRecovery?: string,
    error?: string
  ) => {
    const sign = this.getSign(message, true);
    if (sign === undefined || !sign.posted) {
      throw Error('Invalid message');
    }
    if (status === StatusEnum.Success) {
      if (signature) {
        sign.callback(true, undefined, signature, signatureRecovery);
      } else {
        throw Error('signature is required when sign is successfully');
      }
    } else {
      sign.callback(false, error);
    }
    return this.signAccessMutex.acquire().then((release) => {
      this.signs = this.signs.filter((item) => item.msg !== message);
      release();
    });
  };
}
