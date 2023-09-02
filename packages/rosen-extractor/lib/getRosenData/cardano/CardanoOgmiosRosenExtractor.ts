import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import Utils from '../Utils';
import { TxBabbage, TxOut } from '@cardano-ogmios/schema';
import { CardanoMetadataRosenData, TokenTransformation } from './types';
import { isArray, isString } from 'lodash-es';

export class CardanoOgmiosRosenExtractor extends AbstractRosenDataExtractor<TxBabbage> {
  /**
   * extracts RosenData from given lock transaction in Ogmios format
   * @param transaction the lock transaction in Koios format
   */
  get = (transaction: TxBabbage): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.id}]`;
    const metadata = transaction.metadata;
    try {
      if (metadata !== null) {
        const blob = metadata.body.blob;
        if (blob && blob['0']) {
          const data = Utils.getDictValue(
            blob['0']
          ) as Partial<CardanoMetadataRosenData>;
          if (
            isString(data.to) &&
            isString(data.networkFee) &&
            isString(data.bridgeFee) &&
            isString(data.toAddress) &&
            isArray(data.fromAddress) &&
            data.fromAddress.every(isString)
          ) {
            const rosenData = data as unknown as CardanoMetadataRosenData;

            const lockOutputs = transaction.body.outputs.filter(
              (output) => output.address === this.lockAddress
            );
            for (const output of lockOutputs) {
              const assetTransformation = this.getAssetTransformation(
                output,
                rosenData.to
              );
              if (assetTransformation) {
                return {
                  toChain: rosenData.to,
                  toAddress: rosenData.toAddress,
                  bridgeFee: rosenData.bridgeFee,
                  networkFee: rosenData.networkFee,
                  fromAddress: rosenData.fromAddress.join(''),
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
                `: Incomplete metadata: ${Utils.JsonBI.stringify(metadata)}`
            );
        } else
          this.logger.debug(
            baseError + `: Invalid blob: ${Utils.JsonBI.stringify(metadata)}`
          );
      } else
        this.logger.debug(
          baseError + `: Invalid metadata: ${Utils.JsonBI.stringify(metadata)}`
        );
    } catch (e) {
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
    box: TxOut,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    if (box.value.assets) {
      const assets = Object.keys(box.value.assets);
      if (assets.length > 0) {
        for (const tokenKey of assets) {
          // according to ogmios docs assets are stores as
          //      [policyId.assetName]: amount
          //      [policyId]: amount        if assetName not exists.
          const parts = tokenKey.split('.');
          // if assetName exists, search token with policyId and asset name
          // if not, search token with policyId
          const token = this.tokens.search(
            CARDANO_CHAIN,
            tokenKey.indexOf('.') != -1
              ? { policyId: parts[0].trim(), assetName: parts[1].trim() }
              : { policyId: tokenKey }
          );
          if (token.length > 0) {
            return {
              from: this.tokens.getID(token[0], CARDANO_CHAIN),
              to: this.tokens.getID(token[0], toChain),
              amount: box.value.assets[tokenKey].toString(),
            };
          }
        }
      }
    }

    // try to build transformation using locked ADA
    const lovelace = this.tokens.search(CARDANO_CHAIN, {
      [this.tokens.getIdKey(CARDANO_CHAIN)]: CARDANO_NATIVE_TOKEN,
    });
    if (lovelace.length > 0) {
      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: box.value.coins.toString(),
      };
    } else {
      this.logger.debug(
        `No rosen asset transformation found for Ogmios box with assets: ${Utils.JsonBI.stringify(
          box.value.assets
        )}`
      );
      return undefined;
    }
  };
}
