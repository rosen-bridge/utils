import { AbstractPotChainManager, SigningStatus } from '../../lib';

export class TestPotChainManager implements AbstractPotChainManager {
  notImplemented = () => {
    throw Error('Not implemented');
  };

  getHeight: () => Promise<number> = this.notImplemented;

  // eslint-disable-next-line no-unused-vars
  getTxRequiredConfirmation: (txType: string) => number = this.notImplemented;

  // eslint-disable-next-line no-unused-vars
  getTxConfirmation: (txId: string) => Promise<number> = this.notImplemented;

  isTxValid: (
    // eslint-disable-next-line no-unused-vars
    serializedTx: string,
    // eslint-disable-next-line no-unused-vars
    signingStatus: SigningStatus,
  ) => Promise<boolean> = this.notImplemented;

  // eslint-disable-next-line no-unused-vars
  submitTransaction: (serializedTx: string) => Promise<void> =
    this.notImplemented;

  // eslint-disable-next-line no-unused-vars
  isTxInMempool: (txId: string) => Promise<boolean> = this.notImplemented;
}
