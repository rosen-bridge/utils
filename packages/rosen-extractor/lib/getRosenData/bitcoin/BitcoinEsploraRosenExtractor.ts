import { RosenData, TokenTransformation } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import {
  BITCOIN_CHAIN,
  BITCOIN_NATIVE_TOKEN,
  SUPPORTED_CHAINS,
} from '../const';
import {
  BitcoinEsploraTransaction,
  EsploraTxOutput,
  OpReturnData,
} from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { decodeAddress } from '@rosen-bridge/address-codec';
import { address } from 'bitcoinjs-lib';

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
        opReturnData = this.parseRosenData(outputs[0].scriptpubkey);
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
   * extracts rosen data from OP_RETURN box script pub key
   * @param scriptPubKeyHex
   */
  parseRosenData = (scriptPubKeyHex: string): OpReturnData => {
    // check OP_RETURN opcode
    if (scriptPubKeyHex.slice(0, 2) !== '6a')
      throw Error(`script does not start with OP_RETURN opcode (6a)`);
    // check OP_PUSHDATA1 opcode
    if (scriptPubKeyHex.slice(2, 4) !== '4c')
      throw Error(`script 2nd opcode is not OP_PUSHDATA1 (4c)`);
    // check script length (should not use more than one OP_RETURN)
    const dataLength = scriptPubKeyHex.slice(4, 6);
    if (parseInt(dataLength, 16) + 3 !== scriptPubKeyHex.length / 2)
      throw Error(
        `script length is unexpected [${parseInt(dataLength, 16) + 3} !== ${
          scriptPubKeyHex.length / 2
        }]`
      );

    // parse toChain
    const toChainHex = scriptPubKeyHex.slice(6, 8);
    const toChainCode = parseInt(toChainHex, 16);
    if (toChainCode >= SUPPORTED_CHAINS.length)
      throw Error(
        `invalid toChain code, found [${toChainCode}] but only [${SUPPORTED_CHAINS.length}] chains are supported`
      );
    const toChain = SUPPORTED_CHAINS[toChainCode];

    // parse bridgeFee
    const bridgeFeeHex = scriptPubKeyHex.slice(8, 24);
    const bridgeFee = BigInt('0x' + bridgeFeeHex).toString();

    // parse networkFee
    const networkFeeHex = scriptPubKeyHex.slice(24, 40);
    const networkFee = BigInt('0x' + networkFeeHex).toString();

    // parse toAddress
    const addressLengthCode = scriptPubKeyHex.slice(40, 42);
    const addressHex = scriptPubKeyHex.slice(
      42,
      42 + parseInt(addressLengthCode, 16) * 2
    );
    const toAddress = decodeAddress(toChain, addressHex);

    return {
      toChain,
      toAddress,
      bridgeFee,
      networkFee,
    };
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
