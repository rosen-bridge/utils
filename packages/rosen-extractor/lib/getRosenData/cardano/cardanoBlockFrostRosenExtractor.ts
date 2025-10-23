import JsonBigInt from '@rosen-bridge/json-bigint';
import { isPlainObject } from 'lodash-es';
import * as wasm from '@emurgo/cardano-serialization-lib-nodejs';
import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import { BlockFrostOutputBox, BlockFrostTransaction } from './types';
import { getCardanoTokenId, parseRosenData } from './utils';

export class CardanoBlockFrostRosenExtractor extends AbstractRosenDataExtractor<BlockFrostTransaction> {
  readonly chain = CARDANO_CHAIN;
  /**
   * extracts RosenData from given lock transaction in blockfrost format
   * @param transaction the lock transaction in blockfrost format
   */
  extractRawData = (
    transaction: BlockFrostTransaction,
  ): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.utxos.hash}]`;
    const metadata = transaction.metadataCbor;
    try {
      if (metadata.length === 0) {
        this.logger.debug(baseError + `: No metadata`);
        return undefined;
      }
      const metaDataCbor = metadata.find(
        (data) => data.label === '0',
      )?.metadata;
      if (!metaDataCbor) return undefined;
      const wasmMetadatumObject = wasm.GeneralTransactionMetadata.from_hex(
        metaDataCbor,
      ).get(wasm.BigNum.from_str('0'));
      if (!wasmMetadatumObject)
        throw new Error(
          `ImpossibleBehavior: Found metadata with label "0" in tx [${transaction.utxos.hash}] but failed to read it from CSL object`,
        );

      const data = JSON.parse(
        wasm.decode_metadatum_to_json_str(
          wasmMetadatumObject,
          wasm.MetadataJsonSchema.NoConversions,
        ),
      );
      const rosenData = parseRosenData(data);
      if (rosenData) {
        const lockOutputs = transaction.utxos.outputs.filter(
          (output) => output.address === this.lockAddress,
        );
        for (let i = 0; i < lockOutputs.length; i++) {
          const output = lockOutputs[i];
          const assetTransformation = this.getAssetTransformation(
            output,
            rosenData.toChain,
          );
          if (assetTransformation) {
            return {
              ...rosenData,
              sourceChainTokenId: assetTransformation.from,
              amount: assetTransformation.amount,
              targetChainTokenId: assetTransformation.to,
              sourceTxId: transaction.utxos.hash,
              rawData: metaDataCbor,
            };
          } else
            this.logger.debug(
              `No rosen asset transformation found for box [${
                transaction.utxos.hash
              }.${i}]: box assets: ${JsonBigInt.stringify(output.amount)}`,
            );
        }
        this.logger.debug(
          baseError + `: No valid transformation found in any output boxes`,
        );
      } else
        this.logger.debug(
          baseError +
            `: Incomplete metadata. isPlain: ${isPlainObject(
              data,
            )}, data: ${JsonBigInt.stringify(data)}`,
        );
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Cardano rosen data from BlockFrost: ${e}`,
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
    box: BlockFrostOutputBox,
    toChain: string,
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    for (const asset of box.amount) {
      if (asset.unit === 'lovelace') continue;
      const policyId = asset.unit.slice(0, 56);
      const assetName = asset.unit.slice(56);
      const token = this.tokens.search(CARDANO_CHAIN, {
        tokenId: getCardanoTokenId(policyId, assetName),
      });
      if (token.length > 0 && Object.hasOwn(token[0], toChain))
        return {
          from: this.tokens.getID(token[0], CARDANO_CHAIN),
          to: this.tokens.getID(token[0], toChain),
          amount: asset.quantity,
        };
    }

    // try to build transformation using locked ADA
    const lovelace = this.tokens.search(CARDANO_CHAIN, {
      tokenId: CARDANO_NATIVE_TOKEN,
    });
    if (lovelace.length > 0 && Object.hasOwn(lovelace[0], toChain)) {
      const boxLovelaceAmount = box.amount.find(
        (asset) => asset.unit === 'lovelace',
      );
      if (!boxLovelaceAmount)
        throw Error(
          `ImpossibleBehavior: Found blockfrost tx output with no lovelace amount`,
        );

      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: boxLovelaceAmount.quantity,
      };
    } else {
      return undefined;
    }
  };
}
