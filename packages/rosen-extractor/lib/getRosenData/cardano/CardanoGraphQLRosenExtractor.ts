import { isPlainObject } from 'lodash-es';
import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { CARDANO_CHAIN, CARDANO_NATIVE_TOKEN } from '../const';
import {
  CardanoMetadataRosenData,
  GraphQLTransaction,
  GraphQLTxOutput,
} from './types';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class CardanoGraphQLRosenExtractor extends AbstractRosenDataExtractor<GraphQLTransaction> {
  /**
   * extracts RosenData from given lock transaction in graphql format
   * @param transaction the lock transaction in graphql format
   */
  get = (transaction: GraphQLTransaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.hash}]`;
    const metadata = transaction.metadata;
    try {
      if (!metadata || metadata.length === 0) {
        this.logger.debug(baseError + `: No metadata`);
        return undefined;
      }
      const data = metadata.find((data) => data?.key === '0')?.value;
      if (!data || !isPlainObject(data)) {
        this.logger.debug(
          baseError + `: Invalid metadata: ${JsonBigInt.stringify(metadata)}`
        );
        return undefined;
      }
      const objectKeys = Object.keys(data);
      if (
        objectKeys.includes('to') &&
        objectKeys.includes('bridgeFee') &&
        objectKeys.includes('networkFee') &&
        objectKeys.includes('toAddress') &&
        objectKeys.includes('fromAddress')
      ) {
        const rosenData = data as unknown as CardanoMetadataRosenData;

        const lockOutputs = transaction.outputs.filter(
          (output) => output?.address === this.lockAddress
        );
        for (let i = 0; i < lockOutputs.length; i++) {
          const output = lockOutputs[i];
          if (!output) {
            this.logger.debug(
              `No rosen asset transformation found for box [${transaction.hash}.${i}]: box is undefined!`
            );
          } else {
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
                sourceTxId: transaction.hash,
              };
            } else
              this.logger.debug(
                `No rosen asset transformation found for box [${
                  transaction.hash
                }.${i}]: box assets: ${JsonBigInt.stringify(output.tokens)}`
              );
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
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Cardano rosen data from GraphQL: ${e}`
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
    box: GraphQLTxOutput,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    for (const boxToken of box.tokens) {
      const token = this.tokens.search(CARDANO_CHAIN, {
        assetName: boxToken.asset.assetName,
        policyId: boxToken.asset.policyId,
      });
      if (token.length > 0 && Object.hasOwn(token[0], toChain))
        return {
          from: this.tokens.getID(token[0], CARDANO_CHAIN),
          to: this.tokens.getID(token[0], toChain),
          amount: boxToken.quantity,
        };
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
      return undefined;
    }
  };
}
