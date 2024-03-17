import {
  ActiveGuard,
  Crypto,
  PendingSign,
  Sign,
  SignApprovePayload,
  SignRequestPayload,
  SignStartPayload,
  TssSigner,
} from '../../lib';

export class TestTssSigner extends TssSigner {
  /**
   * get list of signs in current object
   */
  getSigns = () => this.signs as Array<Sign>;

  /**
   * get list of pending signs in current object
   */
  getPendingSigns = () => this.pendingSigns as Array<PendingSign>;

  /**
   * calling protected function getUnknownGuards
   * @param guards
   */
  mockedGetUnknownGuards = (guards: Array<ActiveGuard>) =>
    this.getUnknownGuards(guards);

  /**
   * calling protected function getInvalidGuards
   * @param guards
   */
  mockedGetInvalidGuards = (guards: Array<ActiveGuard>) =>
    this.getInvalidGuards(guards);

  /**
   * calling protected function getSign
   * @param msg
   */
  mockedGetSign = (msg: string) => this.getSign(msg);

  /**
   * calling protected function isNoWorkTime
   */
  mockedIsNoWorkTime = () => this.isNoWorkTime();

  /**
   * calling protected function getPendingSign
   * @param msg
   */
  mockedGetPendingSign = (msg: string) => this.getPendingSign(msg);

  /**
   * calling protected function getApprovedGuards
   * @param timestamp
   * @param payload
   * @param signs
   */
  mockedGetApprovedGuards = (
    timestamp: number,
    payload: SignApprovePayload,
    signs: Array<string>
  ) => this.getApprovedGuards(timestamp, payload, signs);

  /**
   * calling protected function handleRequestMessage
   * @param payload
   * @param sender
   * @param guardIndex
   * @param timestamp
   * @param sendRegister
   */
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

  /**
   * calling protected function handleApproveMessage
   * @param payload
   * @param sender
   * @param guardIndex
   * @param signature
   */
  mockedHandleApproveMessage = (
    payload: SignApprovePayload,
    sender: string,
    guardIndex: number,
    signature: string
  ) => this.handleApproveMessage(payload, sender, guardIndex, signature);

  /**
   * calling protected function handleStartMessage
   * @param payload
   * @param timestamp
   * @param guardIndex
   * @param sender
   */
  mockedHandleStartMessage = (
    payload: SignStartPayload,
    timestamp: number,
    guardIndex: number,
    sender: string
  ) => this.handleStartMessage(payload, timestamp, guardIndex, sender);

  /**
   * calling protected function updateThreshold
   */
  mockedUpdateThreshold = (crypto: Crypto) => this.updateThreshold(crypto);
}
