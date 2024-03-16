import { isPlainObject } from 'lodash-es';
import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import { CardanoMetadataRosenData, KoiosTransaction, Utxo } from './types';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class CardanoKoiosRosenExtractor extends AbstractRosenDataExtractor<KoiosTransaction> {
  /**
   * extracts RosenData from given lock transaction in Koios format
   * @param transaction the lock transaction in Koios format
   */
  get = (transaction: KoiosTransaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.tx_hash}]`;
    const metadata = transaction.metadata;
    try {
      if (metadata && Object.prototype.hasOwnProperty.call(metadata, '0')) {
        const data = metadata['0'];
        if (
          isPlainObject(data) &&
          'to' in data &&
          'bridgeFee' in data &&
          'networkFee' in data &&
          'toAddress' in data &&
          'fromAddress' in data
        ) {
          const rosenData = data as unknown as CardanoMetadataRosenData;

          const lockOutputs = transaction.outputs.filter(
            (output) => output.payment_addr.bech32 === this.lockAddress
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
    box: Utxo,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    if (box.asset_list.length > 0) {
      for (const asset of box.asset_list) {
        const token = this.tokens.search(CARDANO_CHAIN, {
          assetName: asset.asset_name,
          policyId: asset.policy_id,
        });
        if (token.length > 0 && Object.hasOwn(token[0], toChain))
          return {
            from: this.tokens.getID(token[0], CARDANO_CHAIN),
            to: this.tokens.getID(token[0], toChain),
            amount: asset.quantity,
          };
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
        amount: box.value,
      };
    } else {
      this.logger.debug(
        `No rosen asset transformation found for box [${box.tx_hash}.${
          box.tx_index
        }]: box assets: ${JsonBigInt.stringify(box.asset_list)}`
      );
      return undefined;
    }
  };
}
