import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { RUNES_CHAIN } from '../const';
import { BitcoinRpcTransaction, BitcoinRpcTxOutput } from '../bitcoin/types';
import { TokenMap } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { address } from 'bitcoinjs-lib';
import { parseAggregatedData } from './utils';
import JsonBigInt from '@rosen-bridge/json-bigint';
import { LockDataChunk } from './types';
import { MinimalOnChainRosenData } from '../../types';

export class RunesRpcRosenExtractor extends AbstractRosenDataExtractor<BitcoinRpcTransaction> {
  readonly chain = RUNES_CHAIN;
  protected lockScriptPubKey: string;

  constructor(lockAddress: string, tokens: TokenMap, logger?: AbstractLogger) {
    super(lockAddress, tokens, logger);
    this.lockScriptPubKey = address.toOutputScript(lockAddress).toString('hex');
  }

  /**
   * extracts RosenData from given lock transaction in Rpc format
   * @param transaction the lock transaction in Rpc format
   */
  extractRawData = (
    transaction: BitcoinRpcTransaction
  ): RosenData | undefined => {
    const baseError = `No rosen data is found for tx [${transaction.txid}]`;
    try {
      // validate number of output boxes
      const outputs = transaction.vout;
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

      const fromAddress = `box:${transaction.vin[0].txid}.${transaction.vin[0].vout}`;
      return {
        toChain: lockData.toChain,
        toAddress: lockData.toAddress,
        bridgeFee: lockData.bridgeFee,
        networkFee: lockData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: '',
        amount: '',
        targetChainTokenId: '',
        sourceTxId: transaction.txid,
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Runes rosen data from Rpc: ${e}`
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
    outputs: BitcoinRpcTxOutput[]
  ): LockDataChunk[] => {
    const minUtxoValue = 294;
    const lockDataChunks: LockDataChunk[] = [];

    for (let i = 0; i < 4; i++) {
      for (let boxIndex = 0; boxIndex < outputs.length; boxIndex++) {
        const output = outputs[boxIndex];

        if (output.value * 10 ** 8 !== minUtxoValue + i) continue; // wrong data index
        if (output.scriptPubKey.hex.slice(0, 4) !== '0014') continue; // not a native-segwit utxo

        lockDataChunks.push({
          index: i,
          data: output.scriptPubKey.hex.slice(4),
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
    lockDataChunks: LockDataChunk[]
  ): MinimalOnChainRosenData | undefined => {
    let lockData: MinimalOnChainRosenData | undefined;

    try {
      lockData = parseAggregatedData(
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
  protected validateLock = (outputs: BitcoinRpcTxOutput[]): boolean => {
    for (let i = 0; i < outputs.length; i++) {
      if (outputs[i].scriptPubKey.hex === this.lockScriptPubKey) {
        return true;
      }
    }
    return false;
  };
}
