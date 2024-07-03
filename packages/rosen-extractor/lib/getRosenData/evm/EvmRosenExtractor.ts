import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { Transaction } from 'ethers';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { EvmRpcRosenExtractor } from './EvmRpcRosenExtractor';

export class EvmRosenExtractor extends AbstractRosenDataExtractor<string> {
  chain: string;
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
   * extracts RosenData from given lock transaction in ethers Transaction format
   * @param serializedTransaction signed serialized transaction in ethers Transaction format
   */
  extractRawData = (serializedTransaction: string): RosenData | undefined => {
    let transaction: Transaction;
    try {
      transaction = Transaction.from(serializedTransaction);
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
