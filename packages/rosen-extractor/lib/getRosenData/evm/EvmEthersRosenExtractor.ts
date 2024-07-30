import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { Transaction, TransactionResponse } from 'ethers';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { EvmRpcRosenExtractor } from './EvmRpcRosenExtractor';

export class EvmEthersRosenExtractor extends AbstractRosenDataExtractor<TransactionResponse> {
  readonly chain: string;
  protected rpcExtractor: EvmRpcRosenExtractor;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    chain: string,
    nativeToken: string,
    logger?: AbstractLogger
  ) {
    super(lockAddress, tokens, logger);
    this.chain = chain;
    this.rpcExtractor = new EvmRpcRosenExtractor(
      lockAddress,
      tokens,
      chain,
      nativeToken,
      logger
    );
  }

  /**
   * extracts RosenData from given lock transaction in ethers TransactionResponse format
   * @param txRes the lock transaction in ethers TransactionResponse format
   */
  extractRawData = (txRes: TransactionResponse): RosenData | undefined => {
    let transaction: Transaction;
    try {
      transaction = Transaction.from(txRes);
    } catch (e) {
      this.logger.debug(
        `An error occurred while deserializing ${this.chain} tx to extract rosen data: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
      return undefined;
    }
    return this.rpcExtractor.extractRawData(transaction);
  };
}
