import { isPlainObject } from 'lodash-es';
import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import { KoiosCborTransaction } from './types';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { getCardanoTokenId, parseRosenData } from './utils';
import {
  TransactionOutputJSON,
  decode_metadatum_to_json_str,
  BigNum,
  GeneralTransactionMetadata,
  MetadataJsonSchema,
} from '@emurgo/cardano-serialization-lib-nodejs';

export class CardanoKoiosRosenExtractor extends AbstractRosenDataExtractor<KoiosCborTransaction> {
  readonly chain = CARDANO_CHAIN;

  /**
   * extracts RosenData from given lock transaction in Koios format
   * @param transaction the lock transaction in Koios format
   */
  extractRawData = (
    transaction: KoiosCborTransaction
  ): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.tx_hash}]`;
    if (!transaction.auxiliary_data) return undefined;
    const metadata = transaction.auxiliary_data.metadata;
    try {
      if (metadata && Object.prototype.hasOwnProperty.call(metadata, '0')) {
        const metadataObject = GeneralTransactionMetadata.from_json(
          JsonBigInt.stringify(metadata)
        );
        const data = JsonBigInt.parse(
          decode_metadatum_to_json_str(
            metadataObject.get(BigNum.from_str('0'))!,
            MetadataJsonSchema.NoConversions
          )
        );
        const rosenData = parseRosenData(data);
        if (rosenData) {
          const lockOutputs = transaction.body.outputs.filter(
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
                sourceTxId: transaction.tx_hash,
              };
            }
          }
          this.logger.debug(
            baseError + `: No valid transformation found in any output boxes`
          );
        } else
          this.logger.debug(
            baseError +
              `: Incomplete metadata. isPlain: ${isPlainObject(
                data
              )}, data: ${JsonBigInt.stringify(data)}`
          );
      } else
        this.logger.debug(
          baseError + `: Invalid metadata: ${JsonBigInt.stringify(metadata)}`
        );
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Cardano rosen data from Koios: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
    }
    return undefined;
  };

  /**
   * extracts and builds token transformation from UTXO and tokenMap
   * @param box transaction output
   * @param toChain event target chain
   */
  getAssetTransformation = (
    box: TransactionOutputJSON,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    if (box.amount.multiasset) {
      const assets = box.amount.multiasset;
      for (const policyId of Object.keys(assets)) {
        for (const assetName of Object.keys(assets[policyId])) {
          const token = this.tokens.search(CARDANO_CHAIN, {
            tokenId: getCardanoTokenId(policyId, assetName),
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
    }

    // try to build transformation using locked ADA
    const lovelace = this.tokens.search(CARDANO_CHAIN, {
      tokenId: CARDANO_NATIVE_TOKEN,
    });
    if (lovelace.length > 0 && Object.hasOwn(lovelace[0], toChain)) {
      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: box.amount.coin,
      };
    } else {
      this.logger.debug(
        `No rosen asset transformation found for box with assets: ${JsonBigInt.stringify(
          box.amount
        )}`
      );
      return undefined;
    }
  };
}
