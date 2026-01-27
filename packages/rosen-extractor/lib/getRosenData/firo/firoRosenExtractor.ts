import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { FIRO_CHAIN, FIRO_NATIVE_TOKEN } from '../const';
import { FiroTx, FiroTxOutput } from './types';
import { MinimalOnChainRosenData } from '../../types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { parseOpReturn, addressToOutputScript } from './utils';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class FiroRosenExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain = FIRO_CHAIN;
  protected lockScriptPubKey: string;

  constructor(
    lockAddress: string,
    tokens: TokenMap,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(lockAddress, tokens, logger, storeRawData);
    this.lockScriptPubKey = addressToOutputScript(lockAddress);
  }

  /**
   * extracts RosenData from given lock transaction in FiroTx format
   * @param serializedTransaction stringified transaction in FiroTx format
   */
  extractData = (serializedTransaction: string): RosenData | undefined => {
    let transaction: FiroTx;
    try {
      transaction = JsonBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to FiroTx format while extracting rosen data: ${e}`,
      );
    }
    const baseError = `No rosen data found for tx [${transaction.id}]`;
    try {
      const outputs = transaction.outputs;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }

      let validData = false; // an OP_RETURN box with valid data is found
      let validLock = false; // a lock box is found with available asset transformation

      // parse rosen data from OP_RETURN box
      let opReturnData: MinimalOnChainRosenData | undefined;
      let rawData: string = '';
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        if (output.scriptPubKey.slice(0, 2) !== '6a') continue; // not an OP_RETURN utxo

        try {
          opReturnData = parseOpReturn(output.scriptPubKey);
          rawData = output.scriptPubKey;
          validData = true;
          break;
        } catch (e) {
          this.logger.debug(
            `Failed to extract data from OP_RETURN box [${transaction.id}.${i}]: ${e}`,
          );
        }
      }
      if (!validData || !opReturnData) {
        this.logger.debug(
          baseError + `: No OP_RETURN box with valid data is found`,
        );
        return undefined;
      }

      // find target chain token id
      let assetTransformation: TokenTransformation | undefined;
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        if (output.scriptPubKey !== this.lockScriptPubKey) continue; // utxo address is not lock address
        assetTransformation = this.getAssetTransformation(
          output,
          opReturnData.toChain,
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
        toChain: opReturnData.toChain,
        toAddress: opReturnData.toAddress,
        bridgeFee: opReturnData.bridgeFee,
        networkFee: opReturnData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.id,
        rawData,
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Firo rosen data: ${e}`,
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
    box: FiroTxOutput,
    toChain: string,
  ): TokenTransformation | undefined => {
    // try to build transformation using locked FIRO
    const wrappedFiro = this.tokens.search(FIRO_CHAIN, {
      tokenId: FIRO_NATIVE_TOKEN,
    });
    if (wrappedFiro.length > 0 && Object.hasOwn(wrappedFiro[0], toChain)) {
      const value = box.value.toString();
      return {
        from: FIRO_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedFiro[0], toChain),
        amount: value,
      };
    } else {
      return undefined;
    }
  };
}
