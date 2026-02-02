import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { HANDSHAKE_CHAIN, HANDSHAKE_NATIVE_TOKEN } from '../const';
import { HandshakeTx, HandshakeTxOutput, HandshakeRosenData } from './types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseRosenData, addressToHash } from './utils';
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
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }

      let validData = false; // an UPDATE box with valid data is found
      let validLock = false; // a lock box is found with available asset transformation

      // parse rosen data from UPDATE box
      let hnsRosenData: HandshakeRosenData | undefined;
      let rawData: string = '';
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        // Check if this is an UPDATE output (type 7 in Handshake)
        // Note: JsonBigInt may parse type as bigint
        if (Number(output.covenant.type) !== 7) continue;

        try {
          // In Handshake, the UPDATE data is stored in covenant.items at index 2 (hex encoded)
          hnsRosenData = parseRosenData(output.covenant.items[2]);
          rawData = output.covenant.items[2];
          validData = true;
          break;
        } catch (e) {
          this.logger.debug(
            `Failed to extract data from UPDATE box [${transaction.id}.${i}]: ${e}`,
          );
        }
      }
      if (!validData || !hnsRosenData) {
        this.logger.debug(
          baseError + `: No UPDATE box with valid data is found`,
        );
        return undefined;
      }

      // find target chain token id
      let assetTransformation: TokenTransformation | undefined;
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        // Skip UPDATE outputs (type 7) as they can never be lock addresses
        // Note: JsonBigInt may parse type as bigint
        if (Number(output.covenant.type) === 7) continue;

        // Check if the output address hash matches the lock address hash
        if (output.address.hash !== this.lockAddressHash) continue; // utxo address is not lock address

        assetTransformation = this.getAssetTransformation(
          output,
          hnsRosenData.toChain,
        );
        if (assetTransformation) {
          validLock = true;
          break;
        }
      }
      if (!validLock || !assetTransformation) {
        this.logger.debug(
          baseError + `: Failed to find rosen asset transformation`,
        );
        return undefined;
      }

      const fromAddress = `box:${transaction.inputs[0].txId}.${transaction.inputs[0].index}`;
      return {
        toChain: hnsRosenData.toChain,
        toAddress: hnsRosenData.toAddress,
        bridgeFee: hnsRosenData.bridgeFee,
        networkFee: hnsRosenData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.id,
        rawData,
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
    // try to build transformation using locked HNS
    const wrappedHns = this.tokens.search(HANDSHAKE_CHAIN, {
      tokenId: HANDSHAKE_NATIVE_TOKEN,
    });
    if (wrappedHns.length > 0 && Object.hasOwn(wrappedHns[0], toChain)) {
      const dollarydoosAmount = box.value;
      return {
        from: HANDSHAKE_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedHns[0], toChain),
        amount: dollarydoosAmount.toString(),
      };
    } else {
      return undefined;
    }
  };
}
