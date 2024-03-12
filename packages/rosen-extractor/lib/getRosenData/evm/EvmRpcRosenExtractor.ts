import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { Transaction } from 'ethers';
import { RosenTokens, RosenChainToken } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseRosenData } from './utils';

export class EvmRpcRosenExtractor extends AbstractRosenDataExtractor<Transaction> {
  protected chain: string;
  protected nativeToken: string;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    chain: string,
    nativeToken: string,
    logger?: AbstractLogger
  ) {
    super(lockAddress, tokens, logger);
    this.chain = chain;
    this.nativeToken = nativeToken;
  }

  /**
   * extracts RosenData from given lock transaction in ethers Transaction object
   * checks:
   *     Native token transfer:
   *         1. `to` must be the lock address
   *         2. the entire calldata must represent a valid CallDataRosenData
   *     ERC20 transfer:
   *         1. `to` address is one of the supported assets
   *         2. first four bytes of the call data indicate `transfer` function call: a9059cbb
   *         3. bytes from 5 to 37 must be the lock address
   *         4. bytes from 37 to 69 show the amount
   *         5. bytes after 69 must represent a valid CallDataRosenData
   * @param transaction the lock transaction in ethers Transaction object
   */
  get = (transaction: Transaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.hash}]`;
    try {
      if (transaction.from == null || transaction.hash == null) {
        this.logger.debug(
          baseError +
            `transaction 'from' ([${transaction.from}]) or 'hash' ([${transaction.hash}]) is unexpected (probably unsigned transaction is passed)`
        );
        return undefined;
      }
      if (transaction.to == null) {
        this.logger.debug(baseError + `: 'to' address is empty.`);
        return undefined;
      }
      let rosenData;
      const callData = transaction.data.substring(2);
      let token: Record<string, RosenChainToken>;
      let rosenDataRaw;
      let tokenAddress;
      let amount;
      let sourceTokenId, targetTokenId;

      if (transaction.to.toLowerCase() == this.lockAddress) {
        // transaction must be a native token transfer
        rosenDataRaw = callData;
        tokenAddress = this.nativeToken;
        amount = transaction.value.toString();
        const tokens = this.tokens.search(this.chain, {
          [this.tokens.getIdKey(this.chain)]: this.nativeToken,
        });
        if (tokens.length == 1) {
          sourceTokenId = this.nativeToken;
          token = tokens[0];
        } else {
          this.logger.debug(
            baseError +
              `: native token [${this.nativeToken}] is not available in source chian's tokens map.`
          );
          return undefined;
        }
      } else {
        // transaction must be an ERC-20 token transfer
        if (callData.substring(0, 8) != 'a9059cbb') {
          this.logger.debug(
            baseError + `: Not a valid ERC20 transfer transaction.`
          );
          return undefined;
        }
        if (
          BigInt('0x' + callData.substring(8, 72)).toString(16) !=
          this.lockAddress.substring(2)
        ) {
          this.logger.debug(
            baseError + `: 'to' address is not the lock address.`
          );
          return undefined;
        }
        amount = BigInt('0x' + callData.slice(72, 72 + 64)).toString();
        rosenDataRaw = callData.substring(72 + 64);
        tokenAddress = transaction.to.toLowerCase();
        const tokens = this.tokens.search(this.chain, {
          [this.tokens.getIdKey(this.chain)]: tokenAddress,
        });
        if (tokens.length != 1) {
          this.logger.debug(
            baseError +
              `: token [${tokenAddress}] is not supported on chain: [${this.chain}].`
          );
          return undefined;
        }
        token = tokens[0];
        sourceTokenId = tokenAddress.toLowerCase();
      }
      try {
        rosenData = parseRosenData(rosenDataRaw);
      } catch (e) {
        this.logger.debug(
          baseError + `: Failed to extract data from call data: ${e}`
        );
        return undefined;
      }

      try {
        targetTokenId = this.tokens.getID(token, rosenData.toChain);
      } catch (e) {
        this.logger.debug(
          baseError +
            `: token [${tokenAddress}] is not supported on chain: [${rosenData.toChain}].`
        );
        return undefined;
      }
      return {
        toChain: rosenData.toChain,
        toAddress: rosenData.toAddress,
        bridgeFee: rosenData.bridgeFee,
        networkFee: rosenData.networkFee,
        fromAddress: transaction.from.toLowerCase(),
        sourceChainTokenId: sourceTokenId,
        amount: amount,
        targetChainTokenId: targetTokenId,
        sourceTxId: transaction.hash,
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting EVM rosen data from RPC: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
      return undefined;
    }
  };
}
