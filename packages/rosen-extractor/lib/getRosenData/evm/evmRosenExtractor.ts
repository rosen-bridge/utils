import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { Transaction } from 'ethers';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { EvmRpcRosenExtractor } from './evmRpcRosenExtractor';

export class EvmRosenExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain: string;
  protected rpcExtractor: EvmRpcRosenExtractor;

  constructor(
    lockAddress: string,
    tokens: TokenMap,
    chain: string,
    nativeToken: string,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(lockAddress, tokens, logger, storeRawData);
    this.chain = chain;
    this.rpcExtractor = new EvmRpcRosenExtractor(
      lockAddress,
      tokens,
      chain,
      nativeToken,
      logger,
      storeRawData,
    );
  }

  /**
   * extracts RosenData from given lock transaction in ethers Transaction format
   * @param serializedTransaction signed serialized transaction in ethers Transaction format
   */
  protected extractData = (
    serializedTransaction: string,
  ): RosenData | undefined => {
    let transaction: Transaction;
    try {
      transaction = Transaction.from('0x' + serializedTransaction);
    } catch (e) {
      this.logger.debug(
        `An error occurred while deserializing ${this.chain} tx to extract rosen data: ${e}`,
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
      return undefined;
    }
    return this.rpcExtractor.extractData(transaction);
  };
}
