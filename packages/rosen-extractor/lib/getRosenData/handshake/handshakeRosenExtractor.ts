import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { HANDSHAKE_CHAIN, HANDSHAKE_NATIVE_TOKEN } from '../const';
import { HandshakeTx, HandshakeTxOutput, HandshakeRosenData } from './types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseRosenData, addressToHash, extractDataFromOutputs } from './utils';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class HandshakeRosenExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain = HANDSHAKE_CHAIN;
  protected lockAddressHash: string;

  constructor(lockAddress: string, tokens: TokenMap, logger?: AbstractLogger) {
    super(lockAddress, tokens, logger);
    this.lockAddressHash = addressToHash(lockAddress);
  }

  /**
   * extracts RosenData from given lock transaction in HandshakeTx format
   * @param serializedTransaction stringified transaction in HandshakeTx format
   */
  extractRawData = (serializedTransaction: string): RosenData | undefined => {
    let transaction: HandshakeTx;
    try {
      transaction = JsonBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to HandshakeTx format while extracting rosen data: ${e}`,
      );
    }

    const baseError = `No rosen data found for tx [${transaction.id}]`;
    try {
      const outputs = transaction.outputs;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of outputs`);
        return undefined;
      }

      // Extract data from outputs using utility function
      const { validLock, lockOutput, reconstructedData } =
        extractDataFromOutputs(outputs, this.lockAddressHash);

      if (!validLock || !lockOutput) {
        this.logger.debug(baseError + `: Lock output not found`);
        return undefined;
      }

      if (!reconstructedData) {
        this.logger.debug(baseError + `: No data chunks found`);
        return undefined;
      }

      // Parse the reconstructed data
      let rosenData: HandshakeRosenData | undefined;
      try {
        rosenData = parseRosenData(reconstructedData);
        this.logger.debug(
          `Successfully extracted Rosen data for ${rosenData.toChain}`,
        );
      } catch (e) {
        this.logger.debug(
          baseError + `: Failed to parse reconstructed data: ${e}`,
        );
        return undefined;
      }

      // Find asset transformation using the lock output
      const assetTransformation = this.getAssetTransformation(
        lockOutput,
        rosenData.toChain,
      );

      if (!assetTransformation) {
        this.logger.debug(
          baseError + `: Failed to find rosen asset transformation`,
        );
        return undefined;
      }

      const fromAddress = `box:${transaction.inputs[0].txId}.${transaction.inputs[0].index}`;
      return {
        toChain: rosenData.toChain,
        toAddress: rosenData.toAddress,
        bridgeFee: rosenData.bridgeFee,
        networkFee: rosenData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.id,
        rawData: reconstructedData,
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Handshake rosen data: ${e}`,
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
    box: HandshakeTxOutput,
    toChain: string,
  ): TokenTransformation | undefined => {
    const wrappedHns = this.tokens.search(HANDSHAKE_CHAIN, {
      tokenId: HANDSHAKE_NATIVE_TOKEN,
    });

    if (wrappedHns.length > 0 && Object.hasOwn(wrappedHns[0], toChain)) {
      return {
        from: HANDSHAKE_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedHns[0], toChain),
        amount: box.value.toString(),
      };
    }
    return undefined;
  };
}
