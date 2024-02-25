import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { TransactionResponse } from 'ethers';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseRosenData } from './utils';

export class EvmRpcRosenExtractor extends AbstractRosenDataExtractor<TransactionResponse> {
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
   * extracts RosenData from given lock transaction in Rpc format
   * cheks:
   *     Native token transfer:
   *         1. `to` must be the lock address
   *         2. the entire calldata must represent a valid CallDataRosenData
   *     ERC20 transfer:
   *         1. `to` address is one of the supported assets
   *         2. first four bytes of the call data indicate `transfer` function call: a9059cbb
   *         3. bytes from 5 to 37 must be the lock address
   *         4. bytes from 37 to 69 show the amount
   *         5. bytes after 69 must represnt a valid CallDataRosenData
   * @param transaction the lock transaction in Rpc format
   */
  get = (transaction: TransactionResponse): RosenData | undefined => {
    console.log('resid inja');
    const baseError = `No rosen data found for tx [${transaction.hash}]`;
    try {
      if (transaction.to == null) {
        console.log('inja 1');
        this.logger.debug(baseError + `: 'to' address is empty.`);
        return undefined;
      }
      let rosenData;
      const callData = transaction.data.substring(2);
      let tokenId: Record<string, any>;
      let rosenDataRaw;
      let tokenAddress;
      let amount;
      let sourceTokenId, targetTokenId;

      if (transaction.to.substring(2) == this.lockAddress) {
        // transaction must be a native token transfer
        rosenDataRaw = callData;
        tokenAddress = this.nativeToken;
        amount = transaction.value.toString();
        console.log(this.tokens.getIdKey(this.chain));
        const tokenIds = this.tokens.search(this.chain, {
          [this.tokens.getIdKey(this.chain)]: this.nativeToken,
        });
        if (tokenIds.length == 1) {
          sourceTokenId = this.nativeToken;
          tokenId = tokenIds[0];
        } else {
          this.logger.debug(
            baseError +
              `: native token not available in source chian's tokens map.`
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
          this.lockAddress
        ) {
          this.logger.debug(
            baseError + `: 'to' address is not the lock address.`
          );
          return undefined;
        }
        amount = BigInt('0x' + callData.slice(72, 72 + 64)).toString();
        rosenDataRaw = callData.substring(72 + 64);
        tokenAddress = transaction.to.substring(2);
        const token = this.tokens.search(this.chain, {
          [this.tokens.getIdKey(this.chain)]: tokenAddress,
        });
        if (token.length != 1) {
          this.logger.debug(baseError + `: Token is not supported.`);
          return undefined;
        }
        tokenId = token[0];
        try {
          sourceTokenId = this.tokens.getID(tokenId, this.chain);
        } catch (e) {
          this.logger.debug(
            baseError + `: Failed to find the source token ID: ${e}`
          );
          return undefined;
        }
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
        targetTokenId = this.tokens.getID(tokenId, rosenData.toChain);
      } catch (e) {
        this.logger.debug(
          baseError + `: Failed to find the target token ID: ${e}`
        );
        return undefined;
      }
      return {
        toChain: rosenData.toChain,
        toAddress: rosenData.toAddress,
        bridgeFee: rosenData.bridgeFee,
        networkFee: rosenData.networkFee,
        fromAddress: transaction.from.substring(2),
        sourceChainTokenId: sourceTokenId,
        amount: amount,
        targetChainTokenId: targetTokenId,
        sourceTxId: transaction.hash.substring(2),
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Evm rosen data from Rpc: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
      return undefined;
    }
  };
}
