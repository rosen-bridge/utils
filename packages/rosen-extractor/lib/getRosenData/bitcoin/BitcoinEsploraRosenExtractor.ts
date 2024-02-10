import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { BITCOIN_CHAIN, BITCOIN_NATIVE_TOKEN } from '../const';
import {
  BitcoinEsploraTransaction,
  EsploraTxOutput,
  OpReturnData,
} from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { address } from 'bitcoinjs-lib';
import { parseRosenData } from './utils';

export class BitcoinEsploraRosenExtractor extends AbstractRosenDataExtractor<BitcoinEsploraTransaction> {
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
   * @param transaction the lock transaction in Esplora format
   */
  get = (transaction: BitcoinEsploraTransaction): RosenData | undefined => {
    const baseError = `No rosen data found for tx [${transaction.txid}]`;
    try {
      const outputs = transaction.vout;
      if (outputs.length < 2) {
        this.logger.debug(baseError + `: Insufficient number of boxes`);
        return undefined;
      }
      if (outputs[0].scriptpubkey_type !== 'op_return') {
        this.logger.debug(baseError + `: 1st box is not OP_RETURN box`);
        return undefined;
      }
      if (outputs[1].scriptpubkey !== this.lockScriptPubKey) {
        this.logger.debug(baseError + `: 2nd box is not to lock address`);
        return undefined;
      }

      // parse rosen data from OP_RETURN box
      let opReturnData: OpReturnData;
      try {
        opReturnData = parseRosenData(outputs[0].scriptpubkey);
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

      const fromAddress = transaction.vin[0].prevout.scriptpubkey_address;
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
    box: EsploraTxOutput,
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
