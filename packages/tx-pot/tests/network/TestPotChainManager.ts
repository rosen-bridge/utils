import { AbstractPotChainManager, SigningStatus } from '../../lib';

export class TestPotChainManager implements AbstractPotChainManager {
  notImplemented = () => {
    throw Error('Not implemented');
  };

  getHeight: () => Promise<number> = this.notImplemented;

  getTxRequiredConfirmation: (txType: string) => number = this.notImplemented;

  getTxConfirmation: (txId: string) => Promise<number> = this.notImplemented;

  isTxValid: (
    serializedTx: string,
    signingStatus: SigningStatus
  ) => Promise<boolean> = this.notImplemented;

  submitTransaction: (serializedTx: string) => Promise<void> =
    this.notImplemented;

  isTxInMempool: (txId: string) => Promise<boolean> = this.notImplemented;
}
