import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { BITCOIN_CHAIN, BITCOIN_NATIVE_TOKEN } from '../const';
import { BitcoinTx, BitcoinTxOutput, OpReturnData } from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { address } from 'bitcoinjs-lib';
import { parseRosenData } from './utils';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class BitcoinRosenExtractor extends AbstractRosenDataExtractor<string> {
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
   * extracts RosenData from given lock transaction in Esplora format
   * @param serializedTransaction stringified transaction in BitcoinTx format
   */
  get = (serializedTransaction: string): RosenData | undefined => {
    let transaction: BitcoinTx;
    try {
      transaction = JsonBigInt.parse(serializedTransaction);
    } catch (e) {
      throw new Error(
        `Failed to parse transaction json to BitcoinTx format while extracting rosen data: ${e}`
      );
    }
    const baseError = `No rosen data found for tx [${transaction.id}]`;
    try {
      const outputs = transaction.outputs;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }
      if (outputs[1].scriptPubKey !== this.lockScriptPubKey) {
        this.logger.debug(baseError + `: 2nd box is not to lock address`);
        return undefined;
      }

      // parse rosen data from OP_RETURN box
      let opReturnData: OpReturnData;
      try {
        opReturnData = parseRosenData(outputs[0].scriptPubKey);
      } catch (e) {
        this.logger.debug(
          baseError + `: Failed to extract data from OP_RETURN box: ${e}`
        );
        return undefined;
      }

      // find target chain token id
      const assetTransformation = this.getAssetTransformation(
        outputs[1],
        opReturnData?.toChain
      );
      if (!assetTransformation) {
        this.logger.debug(
          baseError + `: Failed to find rosen asset transformation`
        );
        return undefined;
      }

      const fromAddress = address.fromOutputScript(
        Buffer.from(transaction.inputs[0].scriptPubKey, 'hex')
      );
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
      };
    } catch (e) {
      this.logger.debug(
        `An error occurred while getting Bitcoin rosen data from Esplora: ${e}`
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
    box: BitcoinTxOutput,
    toChain: string
  ): TokenTransformation | undefined => {
    // try to build transformation using locked BTC
    const wrappedBtc = this.tokens.search(BITCOIN_CHAIN, {
      [this.tokens.getIdKey(BITCOIN_CHAIN)]: BITCOIN_NATIVE_TOKEN,
    });
    if (wrappedBtc.length > 0 && Object.hasOwn(wrappedBtc[0], toChain)) {
      const satoshiAmount = box.value;
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
