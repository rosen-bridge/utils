import * as crypto from 'crypto';
import {
  ApprovePayload,
  HeartbeatPayload,
  Message,
  MessageHandler,
  RegisterPayload,
} from './types/types';

class GuardHandler {
  private _handler: MessageHandler;
  private readonly _publicKey: string;
  private _approvedPublicKeys: string[];
  private _guardsPeerIds: string[];
  private _guardsLastUpdate: number[]; // timestamp
  private _guardsNounce: string[];
  private readonly _guardsRegisterTimeout: number = 2 * 60 * 1000; // 2 minutes
  private readonly _guardsHeartbeatTimeout: number = 1 * 60 * 1000; // 1 minutes
  constructor(
    handler: MessageHandler,
    guardsPublicKey: string[],
    publicKey: string
  ) {
    this._handler = handler;
    this._approvedPublicKeys = guardsPublicKey;
    this._publicKey = publicKey;
    this._guardsLastUpdate = new Array(guardsPublicKey.length).fill(0);
    this._guardsPeerIds = new Array(guardsPublicKey.length).fill('');
  }

  private generateNounce(size = 32): string {
    return crypto.randomBytes(size).toString('base64');
  }
  private checkMessageSign(parsedMessage: Message): boolean {
    try {
      if (this._approvedPublicKeys.includes(parsedMessage.pk)) {
        if (this._handler.checkSign(parsedMessage.payload)) {
          return true;
        }
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  private publicKeyToIndex(publicKey: string): number {
    return this._approvedPublicKeys.indexOf(publicKey);
  }
  private handleRegisterMessage(
    _payload: RegisterPayload,
    sender: string
  ): void {
    const receivedNounce = _payload.nounce;
    const nounce = this.generateNounce();
    const payload: ApprovePayload = {
      nounce: nounce,
      receivedNounce: receivedNounce,
    };
    this._guardsNounce[this.publicKeyToIndex(sender)] = nounce;
    this._handler.send({
      type: 'approve',
      payload: this._handler.encrypt(JSON.stringify(payload)),
      signature: this._handler.sign(JSON.stringify(payload)),
      receiver: sender,
      pk: this._publicKey,
    });
  }

  /**
   * handle Approve message from other node in the network
   * @param _payload - ApprovePayload
   * @param sender - public key of sender
   * @private
   */
  private handleApproveMessage(_payload: ApprovePayload, sender: string): void {
    const receivedNounce = _payload.receivedNounce;
    const nounce = _payload.nounce;
    const index = this._guardsNounce.indexOf(receivedNounce);
    if (index !== -1) {
      const currentTime = Date.now();
      if (
        currentTime - this._guardsLastUpdate[index] >
        this._guardsHeartbeatTimeout
      ) {
        this._guardsPeerIds[index] = 'save guard peer ID'; //TODO: save guard peer ID
        this._guardsLastUpdate[index] = currentTime;
      }
      if (nounce) {
        const payload: ApprovePayload = {
          receivedNounce: nounce,
        };
        const payloadString = JSON.stringify(payload);

        this._handler.send({
          type: 'approve',
          payload: this._handler.encrypt(payloadString),
          signature: this._handler.sign(payloadString),
          receiver: sender,
          pk: this._publicKey,
        });
      }
    }
  }

  private handleHeartbeatMessage(
    _payload: HeartbeatPayload,
    sender: string
  ): void {
    const nounce = _payload.nounce;
    const payload: ApprovePayload = {
      receivedNounce: nounce,
    };
    const payloadString = JSON.stringify(payload);
    this._handler.send({
      type: 'approve',
      payload: this._handler.encrypt(payloadString),
      signature: this._handler.sign(payloadString),
      receiver: sender,
      pk: this._publicKey,
    });
  }

  /**
   * handle receive message from other node in the network
   * @param message
   * @private
   */
  private handleReceiveMessage(message: string): void {
    const parsedMessage: Message = JSON.parse(message);
    if (this.checkMessageSign(parsedMessage)) {
      const payload = JSON.parse(this._handler.decrypt(parsedMessage.payload));
      switch (parsedMessage.type) {
        case 'register':
          return this.handleRegisterMessage(
            payload as RegisterPayload,
            parsedMessage.pk
          );
        case 'approve':
          return this.handleApproveMessage(
            payload as ApprovePayload,
            parsedMessage.pk
          );
        case 'heartbeat':
          return this.handleHeartbeatMessage(
            payload as HeartbeatPayload,
            parsedMessage.pk
          );
        // default:
        //   return null;
      }
    }
  }

  /**
   * update guards status
   * if guard is pass `guardHeartbeatTimeout` should message of type heartbeat send
   * to that guard and the payload is the new nounce.
   * if guard is pass `guardRegisterTimeout` should message of type register send
   * to that guard and the payload is the new nounce.
   * @private
   */
  private updateGuardsStatus() {
    for (let i = 0; i < this._guardsPeerIds.length; i++) {
      const currentTime = Date.now();
      if (
        currentTime - this._guardsLastUpdate[i] >
        this._guardsRegisterTimeout
      ) {
        this._guardsNounce[i] = this.generateNounce();
        const nounce = this._guardsNounce[i];
        const signature = this._handler.sign(nounce);
        this._handler.send({
          type: 'register',
          payload: nounce,
          signature: signature,
          receiver: this._guardsPeerIds[i],
          pk: this._publicKey,
        });
        this._guardsLastUpdate[i] = currentTime;
      } else if (
        currentTime - this._guardsLastUpdate[i] >
        this._guardsHeartbeatTimeout
      ) {
        this._guardsNounce[i] = this.generateNounce();
        const nounce = this._guardsNounce[i];
        const signature = this._handler.sign(nounce);
        this._handler.send({
          type: 'heartbeat',
          payload: nounce,
          signature: signature,
          receiver: this._guardsPeerIds[i],
          pk: this._publicKey,
        });
        this._guardsLastUpdate[i] = currentTime;
      }
    }
  }

  public getActiveGuards(): string[] {
    const currentTime = Date.now();
    return this._guardsPeerIds.filter((guardPeerId, index) => {
      return (
        guardPeerId !== '' &&
        currentTime - this._guardsLastUpdate[index] <
          this._guardsRegisterTimeout
      );
    });
  }
}
