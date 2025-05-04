import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { RUNES_CHAIN } from '../const';
import { BitcoinTxOutput, BitcoinTx, OpReturnData } from '../bitcoin/types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { address, initEccLib } from 'bitcoinjs-lib';
import { parseRosenData } from './utils';
import JsonBigInt from '@rosen-bridge/json-bigint';
import * as tinySecp from 'tiny-secp256k1';
import { LockDataChunk } from './types';

export class RunesRosenExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain = RUNES_CHAIN;
  protected lockScriptPubKey: string;

  constructor(lockAddress: string, tokens: TokenMap, logger?: AbstractLogger) {
    super(lockAddress, tokens, logger);
    initEccLib(tinySecp);
    this.lockScriptPubKey = address.toOutputScript(lockAddress).toString('hex');
  }

  /**
   * extracts RosenData from given lock transaction in BitcoinTx format
   * @param serializedTransaction stringified transaction in BitcoinTx format
   */
  extractRawData = (serializedTransaction: string): RosenData | undefined => {
    let transaction: BitcoinTx;
    try {
      transaction = JsonBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to BitcoinTx format while extracting rosen data: ${e}`
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

      // validate lock conditions
      const validLock = this.validateLock(outputs);
      if (!validLock) {
        this.logger.debug(baseError + `: Failed to find rosen lock utxo`);
        return undefined;
      }

      // validate data conditions
      const lockDataChunks = this.getLockDataChunks(outputs);
      const lockData = this.lockDataFromChunks(lockDataChunks);

      if (!lockData) {
        this.logger.debug(
          baseError + `: Failed to extract rosen data from utxos`
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
        sourceChainTokenId: 'undefined',
        amount: '0',
        targetChainTokenId: 'undefined',
        sourceTxId: transaction.id,
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Runes rosen data from BitcoinTx: ${e}`
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
  getLockDataChunks = (outputs: BitcoinTxOutput[]): LockDataChunk[] => {
    const minUtxoValue = 294n;
    const lockDataChunks: LockDataChunk[] = [];

    for (let i = 0n; i < 4n; i++) {
      for (let boxIndex = 0; boxIndex < outputs.length; boxIndex++) {
        const output = outputs[boxIndex];

        if (output.value !== minUtxoValue + i) continue; // wrong data index
        if (output.scriptPubKey.slice(0, 4) !== '0014') continue; // not a native-segwit utxo

        lockDataChunks.push({
          index: Number(i),
          data: output.scriptPubKey.slice(4),
        });
      }
    }

    return lockDataChunks;
  };

  /**
   * combines lock data chunks into lock data object
   * @param lockDataChunks
   * @return lock data object or undefined
   */
  lockDataFromChunks = (
    lockDataChunks: LockDataChunk[]
  ): OpReturnData | undefined => {
    let lockData: OpReturnData | undefined;

    try {
      lockData = parseRosenData(
        lockDataChunks.map((chunk) => chunk.data).join('')
      );
    } catch (e) {
      this.logger.debug(
        `Failed to extract data from chunks [${JsonBigInt.stringify(
          lockDataChunks
        )}]: ${e}`
      );
    }

    return lockData;
  };

  /**
   * check lock box exists in the tx outputs
   * @param outputs
   * @return boolean
   */
  validateLock = (outputs: BitcoinTxOutput[]): boolean => {
    let validLock = false;
    for (let i = 0; i < outputs.length; i++) {
      const output = outputs[i];
      if (output.scriptPubKey === this.lockScriptPubKey) {
        validLock = true;
        break;
      }
    }
    return validLock;
  };
}
