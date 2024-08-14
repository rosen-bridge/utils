import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { ERGO_CHAIN, ERGO_NATIVE_TOKEN } from '../const';
import { NodeOutputBox, NodeTransaction } from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { Address, Constant } from 'ergo-lib-wasm-nodejs';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { decodeAddress } from '@rosen-bridge/address-codec';

export class ErgoNodeRosenExtractor extends AbstractRosenDataExtractor<NodeTransaction> {
  readonly chain = ERGO_CHAIN;
  lockErgoTree: string;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(lockAddress, tokens, logger);
    this.lockErgoTree = Address.from_base58(lockAddress)
      .to_ergo_tree()
      .to_base16_bytes();
  }

  /**
   * extracts RosenData from given lock transaction in Node format
   * @param transaction the lock transaction in Node format
   */
  extractRawData = (transaction: NodeTransaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.id}]`;
    try {
      for (const box of transaction.outputs) {
        const boxBaseError = `No rosen data found in box [${box.boxId}]`;
        if (box.ergoTree === this.lockErgoTree && box.additionalRegisters?.R4) {
          const R4 = Constant.decode_from_base16(box.additionalRegisters.R4);
          if (R4) {
            const R4Serialized = R4.to_coll_coll_byte();
            if (R4Serialized.length >= 5) {
              const toChain = Buffer.from(R4Serialized[0]).toString();
              const toAddress = decodeAddress(
                toChain,
                Buffer.from(R4Serialized[1]).toString()
              );

              const assetTransformation = this.getAssetTransformation(
                box,
                toChain
              );
              if (assetTransformation) {
                return {
                  toChain: toChain,
                  toAddress: toAddress,
                  bridgeFee: Buffer.from(R4Serialized[3]).toString(),
                  networkFee: Buffer.from(R4Serialized[2]).toString(),
                  fromAddress: Buffer.from(R4Serialized[4]).toString(),
                  sourceChainTokenId: assetTransformation.from,
                  amount: assetTransformation.amount,
                  targetChainTokenId: assetTransformation.to,
                  sourceTxId: transaction.id,
                };
              }
            } else
              this.logger.debug(
                boxBaseError +
                  `: length of data in R4 is less than expected [${R4Serialized.length} < 5]`
              );
          }
        } else {
          if (box.ergoTree !== this.lockErgoTree)
            this.logger.debug(
              boxBaseError +
                `: invalid ergo tree [${box.ergoTree} !== ${this.lockErgoTree}]`
            );
          else this.logger.debug(boxBaseError + `: no R4`);
        }
      }
      this.logger.debug(
        baseError + `: No valid rosen data found in any output box registers`
      );
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Ergo rosen data: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
    }
    return undefined;
  };

  /**
   * extracts and builds token transformation from NodeOutputBox and tokenMap
   * @param box transaction output
   * @param toChain event target chain
   */
  getAssetTransformation = (
    box: NodeOutputBox,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked tokens
    if (box.assets && box.assets.length > 0) {
      for (const lockedToken of box.assets) {
        const token = this.tokens.search(ERGO_CHAIN, {
          [this.tokens.getIdKey(ERGO_CHAIN)]: lockedToken.tokenId,
        });
        if (token.length > 0 && Object.hasOwn(token[0], toChain)) {
          return {
            from: lockedToken.tokenId,
            to: this.tokens.getID(token[0], toChain),
            amount: lockedToken.amount.toString(),
          };
        }
      }
    }

    // try to build transformation using locked Erg
    const erg = this.tokens.search(ERGO_CHAIN, {
      [this.tokens.getIdKey(ERGO_CHAIN)]: ERGO_NATIVE_TOKEN,
    });
    if (erg.length > 0 && Object.hasOwn(erg[0], toChain)) {
      return {
        from: ERGO_NATIVE_TOKEN,
        to: this.tokens.getID(erg[0], toChain),
        amount: box.value.toString(),
      };
    } else {
      this.logger.debug(
        `No rosen asset transformation found for box [${
          box.boxId
        }]: box assets: ${JsonBigInt.stringify(box.assets)}`
      );
      return undefined;
    }
  };
}
