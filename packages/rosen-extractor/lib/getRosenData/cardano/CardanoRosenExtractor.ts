import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { RosenData, TokenTransformation } from '../abstract/types';
import {
  CardanoBoxCandidate,
  CardanoMetadataRosenData,
  CardanoTx,
} from './types';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class CardanoRosenExtractor extends AbstractRosenDataExtractor<string> {
  /**
   * extracts RosenData from given lock transaction in CardanoTx format
   * @param serializedTransaction stringified transaction in CardanoTx format
   */
  get = (serializedTransaction: string): RosenData | undefined => {
    let transaction: CardanoTx;
    try {
      transaction = JsonBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to CardanoTx format while extracting rosen data: ${e}`
      );
    }
    const baseError = `No rosen data found for tx [${transaction.id}]`;
    const rosenMetadata = transaction.metadata?.['0'];
    if (!rosenMetadata || typeof rosenMetadata === 'string') {
      this.logger.debug(
        baseError + `: Invalid metadata type: ${typeof rosenMetadata}`
      );
      return undefined;
    }
    if (
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
      this.logger.debug(
        baseError + `: No valid transformation found in any output boxes`
      );
    } else
      this.logger.debug(
        baseError +
          `: Incomplete metadata: ${JsonBigInt.stringify(transaction.metadata)}`
      );
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
        amount: box.value.toString(),
      };
    } else {
      this.logger.debug(
        `No rosen asset transformation found for CardanoBoxCandidate with assets: ${JsonBigInt.stringify(
          box.assets
        )}`
      );
      return undefined;
    }
  };
}
