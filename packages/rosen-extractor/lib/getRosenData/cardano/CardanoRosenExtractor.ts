import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { RosenData } from '../abstract/types';
import {
  CardanoBoxCandidate,
  CardanoMetadataRosenData,
  CardanoTx,
  TokenTransformation,
} from './types';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import * as JSONBigInt from 'json-bigint';

export class CardanoRosenExtractor extends AbstractRosenDataExtractor<string> {
  /**
   * extracts RosenData from given lock transaction in CardanoTx format
   * @param serializedTransaction stringified transaction in CardanoTx format
   */
  get = (serializedTransaction: string): RosenData | undefined => {
    let transaction: CardanoTx;
    try {
      transaction = JSONBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to CardanoTx format while extracting rosen data: ${e}`
      );
    }
    const rosenMetadata = transaction.metadata?.['0'];
    if (
      rosenMetadata &&
      'to' in rosenMetadata &&
      'bridgeFee' in rosenMetadata &&
      'networkFee' in rosenMetadata &&
      'toAddress' in rosenMetadata &&
      'fromAddress' in rosenMetadata
    ) {
      const data = rosenMetadata as unknown as CardanoMetadataRosenData;
      const lockOutputs = transaction.outputs.filter(
        (output) => output.address === this.lockAddress
      );
      for (const output of lockOutputs) {
        const assetTransformation = this.getAssetTransformation(
          output,
          data.to
        );
        if (assetTransformation) {
          return {
            toChain: data.to,
            toAddress: data.toAddress,
            bridgeFee: data.bridgeFee,
            networkFee: data.networkFee,
            fromAddress: data.fromAddress.join(''),
            sourceChainTokenId: assetTransformation.from,
            amount: assetTransformation.amount,
            targetChainTokenId: assetTransformation.to,
            sourceTxId: transaction.id,
          };
        }
      }
    }
    return undefined;
  };

  /**
   * extracts and builds token transformation from CardanoBoxCandidate and tokenMap
   * @param box transaction output in CardanoBoxCandidate format
   * @param toChain event target chain
   */
  getAssetTransformation = (
    box: CardanoBoxCandidate,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    if (box.assets.length > 0) {
      for (const asset of box.assets) {
        const token = this.tokens.search(CARDANO_CHAIN, {
          assetName: asset.asset_name,
          policyId: asset.policy_id,
        });
        if (token.length > 0)
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
    if (lovelace.length > 0) {
      return {
        from: CARDANO_NATIVE_TOKEN,
        to: this.tokens.getID(lovelace[0], toChain),
        amount: box.value.toString(),
      };
    } else return undefined;
  };
}
