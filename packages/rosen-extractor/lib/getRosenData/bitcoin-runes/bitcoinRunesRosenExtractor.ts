import { address } from 'bitcoinjs-lib';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { BITCOIN_RUNES_CHAIN } from '../const';
import { MinimalOnChainRosenData } from '../../types';
import { minUtxoValue } from './constants';
import { BitcoinRunesTxOutput, BitcoinRunesTx, LockDataChunk } from './types';
import { parseAggregatedData } from './utils';

export class BitcoinRunesRosenExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain = BITCOIN_RUNES_CHAIN;
  protected lockScriptPubKey: string;

  constructor(lockAddress: string, tokens: TokenMap, logger?: AbstractLogger) {
    super(lockAddress, tokens, logger);
    this.lockScriptPubKey = address.toOutputScript(lockAddress).toString('hex');
  }

  /**
   * extracts RosenData from given lock transaction in BitcoinRunesTx format
   * @param serializedTransaction stringified transaction in BitcoinRunesTx format
   */
  extractRawData = (serializedTransaction: string): RosenData | undefined => {
    let transaction: BitcoinRunesTx;
    try {
      transaction = JsonBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to BitcoinRunesTx format while extracting rosen data: ${e}`,
      );
    }
    const baseError = `No rosen data is found for tx [${transaction.id}]`;
    try {
      // validate number of output boxes
      const outputs = transaction.outputs;
      if (outputs.length < 5) {
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }

      // validate data conditions
      const lockDataChunks = this.getLockDataChunks(outputs);
      const lockData = this.lockDataFromChunks(lockDataChunks);

      if (!lockData) {
        this.logger.debug(
          baseError + `: Failed to extract rosen data from utxos`,
        );
        return undefined;
      }

      // validate lock conditions
      let validLock = false;
      let assetTransformation: TokenTransformation | undefined;
      for (let i = 0; i < outputs.length; i++) {
        if (outputs[i].scriptPubKey === this.lockScriptPubKey) {
          assetTransformation = this.getAssetTransformation(
            outputs[i],
            lockData.toChain,
          );
          if (assetTransformation) {
            validLock = true;
            break;
          }
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
        toChain: lockData.toChain,
        toAddress: lockData.toAddress,
        bridgeFee: lockData.bridgeFee,
        networkFee: lockData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.id,
        rawData: '',
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Runes rosen data from BitcoinRunesTx: ${e}`,
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
    }
    return undefined;
  };

  /**
   * extracts RosenData chunks from tx outputs
   * @param outputs
   * @return array of LockDataChunk
   */
  protected getLockDataChunks = (
    outputs: BitcoinRunesTxOutput[],
  ): LockDataChunk[] => {
    const lockDataChunks: LockDataChunk[] = [];

    for (let i = 0; i < 4; i++) {
      // the first 3 boxes are expected to be change, OP_RETURN and lock address, which should not be considered for data chunks
      for (let boxIndex = 3; boxIndex < outputs.length; boxIndex++) {
        const output = outputs[boxIndex];

        if (output.value !== BigInt(minUtxoValue) + BigInt(i)) continue; // wrong data index
        if (output.scriptPubKey.slice(0, 4) !== '0014') continue; // not a native-segwit utxo

        lockDataChunks.push({
          index: i,
          data: output.scriptPubKey.slice(4),
        });
        break;
      }
    }

    return lockDataChunks;
  };

  /**
   * combines lock data chunks into lock data object
   * @param lockDataChunks
   * @return lock data object or undefined
   */
  protected lockDataFromChunks = (
    lockDataChunks: LockDataChunk[],
  ): MinimalOnChainRosenData | undefined => {
    let lockData: MinimalOnChainRosenData | undefined;

    try {
      lockData = parseAggregatedData(
        lockDataChunks.map((chunk) => chunk.data).join(''),
      );
    } catch (e) {
      this.logger.debug(
        `Failed to extract data from chunks [${JsonBigInt.stringify(
          lockDataChunks,
        )}]: ${e}`,
      );
    }

    return lockData;
  };

  /**
   * extracts and builds token transformation from UTXO and tokenMap
   * @param box transaction output
   * @param toChain event target chain
   */
  getAssetTransformation = (
    box: BitcoinRunesTxOutput,
    toChain: string,
  ): TokenTransformation | undefined => {
    // try to build transformation using locked assets
    for (const asset of box.runes) {
      const token = this.tokens.search(BITCOIN_RUNES_CHAIN, {
        tokenId: asset.runeId,
      });
      if (token.length > 0 && Object.hasOwn(token[0], toChain))
        return {
          from: this.tokens.getID(token[0], BITCOIN_RUNES_CHAIN),
          to: this.tokens.getID(token[0], toChain),
          amount: asset.quantity.toString(),
        };
    }
    return undefined;
  };
}
