import { SigningStatus } from '../transaction/types';

export abstract class AbstractPotChainManager {
  /**
   * gets the blockchain current height
   */
  abstract getHeight: () => Promise<number>;

  /**
   * returns required number of confirmation
   * @param txType
   */
  abstract getTxRequiredConfirmation: (txType: string) => number;

  /**
   * gets number of confirmation for a tx
   *  returns -1 if tx is not in the blockchain
   * @param txId
   */
  abstract getTxConfirmation: (txId: string) => Promise<number>;

  /**
   * checks if a tx is still valid and can be sent to the network
   * @param serializedTx
   * @param signingStatus
   */
  abstract isTxValid: (
    serializedTx: string,
    signingStatus: SigningStatus
  ) => Promise<boolean>;

  /**
   * submits a tx to the blockchain
   * @param serializedTx
   */
  abstract submitTransaction: (serializedTx: string) => Promise<void>;

  /**
   * checks if a tx is in mempool
   *  returns false if the chain has no mempool
   * @param txId
   */
  abstract isTxInMempool: (txId: string) => Promise<boolean>;
}
