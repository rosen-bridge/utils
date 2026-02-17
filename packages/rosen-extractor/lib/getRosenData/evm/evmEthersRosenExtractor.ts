import { Transaction, TransactionResponse } from 'ethers';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';

import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { RosenData } from '../abstract/types';
import { EvmRpcRosenExtractor } from './evmRpcRosenExtractor';

export class EvmEthersRosenExtractor extends AbstractRosenDataExtractor<TransactionResponse> {
  readonly chain: string;
  protected rpcExtractor: EvmRpcRosenExtractor;
  protected supportedTokens: string[];

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
    this.updateSupportedTokens();
    this.tokens.registerCallback(this.updateSupportedTokens);
  }

  /**
   * extracts RosenData from given lock transaction in ethers TransactionResponse format
   * @param txRes the lock transaction in ethers TransactionResponse format
   */
  extractData = (txRes: TransactionResponse): RosenData | undefined => {
    let transaction: Transaction;
    try {
      const toAddress = txRes.to?.toLowerCase();
      if (
        toAddress &&
        (toAddress === this.lockAddress ||
          this.supportedTokens.includes(toAddress))
      ) {
        transaction = Transaction.from(txRes);
      } else {
        return undefined;
      }
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

  /**
   * update supported tokens
   * @param tokens
   */
  updateSupportedTokens = () => {
    const newSupportedTokens: string[] = [];
    this.tokens.getConfig().forEach((tokenSet) => {
      if (Object.hasOwn(tokenSet, this.chain))
        newSupportedTokens.push(tokenSet[this.chain].tokenId);
    });
    this.supportedTokens = newSupportedTokens;
  };
}
