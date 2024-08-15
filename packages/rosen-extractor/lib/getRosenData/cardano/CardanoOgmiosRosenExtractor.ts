import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import {
  ObjectNoSchema,
  Transaction,
  TransactionOutput,
} from '@cardano-ogmios/schema';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { parseRosenData } from './utils';
import { UnsupportedAddressError } from '@rosen-bridge/address-codec';

export class CardanoOgmiosRosenExtractor extends AbstractRosenDataExtractor<Transaction> {
  readonly chain = CARDANO_CHAIN;
  /**
   * extracts RosenData from given lock transaction in Ogmios format
   * @param transaction the lock transaction in Koios format
   */
  extractRawData = (transaction: Transaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.id}]`;
    const metadata = transaction.metadata;
    try {
      if (metadata) {
        const blob = metadata.labels;
        if (blob && blob['0'] && blob['0'].json) {
          const data = blob['0'].json as ObjectNoSchema;
          const rosenData = parseRosenData(data);
          if (rosenData) {
            const lockOutputs = transaction.outputs.filter(
              (output) => output.address === this.lockAddress
            );
            for (const output of lockOutputs) {
              const assetTransformation = this.getAssetTransformation(
                output,
                rosenData.toChain
              );
              if (assetTransformation) {
                return {
                  ...rosenData,
                  sourceChainTokenId: assetTransformation.from,
                  amount: assetTransformation.amount,
                  targetChainTokenId: assetTransformation.to,
                  sourceTxId: transaction.id,
                };
              }
            }
            this.logger.debug(
              baseError + `: No valid transformation found in any output boxes`
            );
          } else
            this.logger.debug(
              baseError +
                `: Incomplete metadata: ${JsonBigInt.stringify(metadata)}`
            );
        } else
          this.logger.debug(
            baseError + `: Invalid blob: ${JsonBigInt.stringify(metadata)}`
          );
      } else
        this.logger.debug(
          baseError + `: Invalid metadata: ${JsonBigInt.stringify(metadata)}`
        );
    } catch (e) {
      if (e instanceof UnsupportedAddressError) {
        this.logger.debug(
          `Invalid metadata, toAddress is not valid and validation failed with error: ${e.message}`
        );
        return undefined;
      }
      this.logger.debug(
        `An error occurred while getting Cardano rosen data from Ogmios: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
    }
    return undefined;
  };

  /**
   * extracts and builds token transformation from TxOut and tokenMap
   * @param box transaction output
   * @param toChain event target chain
   */
  getAssetTransformation = (
    box: TransactionOutput,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    const assets = box.value;
    for (const policyId of Object.keys(assets)) {
      if (policyId === CARDANO_NATIVE_TOKEN) continue;
      // according to ogmios v6 docs assets are stores as
      //      [policyId]: {[assetName]: amount}
      for (const assetName of Object.keys(assets[policyId])) {
        const token = this.tokens.search(CARDANO_CHAIN, {
          policyId: policyId,
          assetName: assetName,
        });
        if (token.length > 0 && Object.hasOwn(token[0], toChain)) {
          return {
            from: this.tokens.getID(token[0], CARDANO_CHAIN),
            to: this.tokens.getID(token[0], toChain),
            amount: assets[policyId][assetName].toString(),
          };
        }
      }
    }

    // try to build transformation using locked ADA
    const lovelace = this.tokens.search(CARDANO_CHAIN, {
      [this.tokens.getIdKey(CARDANO_CHAIN)]: CARDANO_NATIVE_TOKEN,
    });
    if (lovelace.length > 0 && Object.hasOwn(lovelace[0], toChain)) {
      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: assets.ada.lovelace.toString(),
      };
    } else {
      this.logger.debug(
        `No rosen asset transformation found for Ogmios box with assets: ${JsonBigInt.stringify(
          box.value.assets
        )}`
      );
      return undefined;
    }
  };
}
