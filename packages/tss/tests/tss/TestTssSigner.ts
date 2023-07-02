import {
  ActiveGuard,
  PendingSign,
  Sign,
  SignApprovePayload,
  SignRequestPayload,
  SignStartPayload,
  TssSigner,
} from '../../lib';

export class TestTssSigner extends TssSigner {
  getSigns = () => (this as any).signs as Array<Sign>;

  getPendingSigns = () => (this as any).pendingSigns as Array<PendingSign>;

  mockedGetUnknownGuards = (guards: Array<ActiveGuard>) =>
    this.getUnknownGuards(guards);

  mockedGetInvalidGuards = (guards: Array<ActiveGuard>) =>
    this.getInvalidGuards(guards);

  mockedGetSign = (msg: string) => this.getSign(msg);

  mockedIsNoWorkTime = () => this.isNoWorkTime();

  mockedGetPendingSign = (msg: string) => this.getPendingSign(msg);

  mockedHandleRequestMessage = (
    payload: SignRequestPayload,
    sender: string,
    guardIndex: number,
    timestamp: number,
    sendRegister: boolean
  ) =>
    this.handleRequestMessage(
      payload,
      sender,
      guardIndex,
      timestamp,
      sendRegister
    );

  mockedHandleApproveMessage = (
    payload: SignApprovePayload,
    sender: string,
    guardIndex: number,
    signature: string
  ) => this.handleApproveMessage(payload, sender, guardIndex, signature);

  mockedHandleStartMessage = (
    payload: SignStartPayload,
    timestamp: number,
    guardIndex: number,
    sender: string
  ) => this.handleStartMessage(payload, timestamp, guardIndex, sender);
}
