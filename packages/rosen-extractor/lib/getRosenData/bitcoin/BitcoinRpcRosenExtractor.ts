import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { BITCOIN_CHAIN, BITCOIN_NATIVE_TOKEN } from '../const';
import {
  BitcoinRpcTransaction,
  BitcoinRpcTxOutput,
  OpReturnData,
} from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { address } from 'bitcoinjs-lib';
import { parseRosenData } from './utils';

export class BitcoinRpcRosenExtractor extends AbstractRosenDataExtractor<BitcoinRpcTransaction> {
  protected lockScriptPubKey: string;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(lockAddress, tokens, logger);
    this.lockScriptPubKey = address.toOutputScript(lockAddress).toString('hex');
  }

  /**
   * extracts RosenData from given lock transaction in Rpc format
   * @param transaction the lock transaction in Rpc format
   */
  get = (transaction: BitcoinRpcTransaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.txid}]`;
    try {
      const outputs = transaction.vout;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }

      let validData = false; // an OP_RETURN box with valid data is found
      let validLock = false; // a lock box is found with available asset transformation

      // parse rosen data from OP_RETURN box
      let opReturnData: OpReturnData | undefined;
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        if (output.scriptPubKey.hex.slice(0, 2) !== '6a') continue; // not an OP_RETURN utxo

        try {
          opReturnData = parseRosenData(output.scriptPubKey.hex);
          validData = true;
          break;
        } catch (e) {
          this.logger.debug(
            `Failed to extract data from OP_RETURN box [${transaction.txid}.${i}]: ${e}`
          );
        }
      }
      if (!validData || !opReturnData) {
        this.logger.debug(
          baseError + `: No OP_RETURN box with valid data is found`
        );
        return undefined;
      }

      // find target chain token id
      let assetTransformation: TokenTransformation | undefined;
      for (let i = 0; i < outputs.length; i++) {
        const output = outputs[i];
        if (output.scriptPubKey.hex !== this.lockScriptPubKey) continue; // utxo address is not lock address
        assetTransformation = this.getAssetTransformation(
          output,
          opReturnData.toChain
        );
        if (assetTransformation) {
          validLock = true;
          break;
        }
      }
      if (!validLock || !assetTransformation) {
        this.logger.debug(
          baseError + `: Failed to find rosen asset transformation`
        );
        return undefined;
      }

      const fromAddress = `box:${transaction.vin[0].txid}.${transaction.vin[0].vout}`;
      return {
        toChain: opReturnData.toChain,
        toAddress: opReturnData.toAddress,
        bridgeFee: opReturnData.bridgeFee,
        networkFee: opReturnData.networkFee,
        fromAddress: fromAddress,
        sourceChainTokenId: assetTransformation.from,
        amount: assetTransformation.amount,
        targetChainTokenId: assetTransformation.to,
        sourceTxId: transaction.txid,
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Bitcoin rosen data from Rpc: ${e}`
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
    box: BitcoinRpcTxOutput,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation ushsing locked BTC
    const wrappedBtc = this.tokens.search(BITCOIN_CHAIN, {
      [this.tokens.getIdKey(BITCOIN_CHAIN)]: BITCOIN_NATIVE_TOKEN,
    });
    if (wrappedBtc.length > 0 && Object.hasOwn(wrappedBtc[0], toChain)) {
      const satoshiAmount = Math.floor(box.value * 100000000);
      return {
        from: BITCOIN_NATIVE_TOKEN,
        to: this.tokens.getID(wrappedBtc[0], toChain),
        amount: satoshiAmount.toString(),
      };
    } else {
      return undefined;
    }
  };
}
