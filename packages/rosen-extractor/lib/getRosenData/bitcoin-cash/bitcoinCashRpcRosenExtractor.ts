import {
  decodeTransactionBCH,
  encodeTransactionBCH,
  hashTransaction,
} from '@bitauth/libauth';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { encodeBitcoinCashAddress } from '@rosen-bridge/address-codec-bitcoin-cash';
import { TokenMap } from '@rosen-bridge/tokens';

import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { RosenData, TokenTransformation } from '../abstract/types';
import { BITCOIN_CASH_CHAIN, BITCOIN_CASH_NATIVE_TOKEN } from '../const';
import { BitcoinCashRpcTransaction } from './types';
import {
  bitcoinCashOutputMatchesRpc,
  isHex,
  MAX_BITCOIN_CASH_TRANSACTION_BYTES,
  MAX_BITCOIN_CASH_TRANSACTION_IO,
  parseBitcoinCashOpReturn,
} from './utils';

/** Native BCH only: CashAddr treasury, raw transaction amounts, no CashTokens. */
export class BitcoinCashRpcRosenExtractor extends AbstractRosenDataExtractor<BitcoinCashRpcTransaction> {
  readonly chain = BITCOIN_CASH_CHAIN;
  protected readonly lockScriptPubKey: string;

  /**
   * Configure a native treasury and the authoritative asset map.
   * @param lockAddress ordinary mainnet P2PKH CashAddr
   * @param tokens configured Rosen asset mappings
   * @param logger optional extraction logger
   * @param storeRawData whether inherited get retains the original payload
   */
  constructor(
    lockAddress: string,
    tokens: TokenMap,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(lockAddress, tokens, logger, storeRawData);
    this.lockScriptPubKey = encodeBitcoinCashAddress(lockAddress);
  }

  /**
   * Authenticate raw transaction bytes against their RPC projection.
   * @param transaction raw bytes, input references and projected outputs
   * @returns native deposit fields, or undefined for invalid or unsupported data
   */
  extractData = (
    transaction: BitcoinCashRpcTransaction,
  ): RosenData | undefined => {
    try {
      if (
        typeof transaction.hex !== 'string' ||
        transaction.hex.length > MAX_BITCOIN_CASH_TRANSACTION_BYTES * 2 ||
        !isHex(transaction.hex) ||
        !/^[0-9a-fA-F]{64}$/.test(transaction.txid) ||
        transaction.vin.length < 1 ||
        transaction.vin.length > MAX_BITCOIN_CASH_TRANSACTION_IO ||
        transaction.vout.length < 2 ||
        transaction.vout.length > MAX_BITCOIN_CASH_TRANSACTION_IO
      )
        return undefined;
      // Libauth expects Uint8Array.slice() to copy; Buffer.slice() aliases bytes.
      const bytes = Uint8Array.from(Buffer.from(transaction.hex, 'hex'));
      const decoded = decodeTransactionBCH(bytes);
      if (
        typeof decoded === 'string' ||
        hashTransaction(bytes) !== transaction.txid.toLowerCase() ||
        Buffer.from(encodeTransactionBCH(decoded)).toString('hex') !==
          transaction.hex.toLowerCase() ||
        decoded.inputs.length !== transaction.vin.length ||
        decoded.outputs.length !== transaction.vout.length
      )
        return undefined;
      const input = decoded.inputs[0];
      const reference = transaction.vin[0];
      const inputTxId = Buffer.from(input.outpointTransactionHash).toString(
        'hex',
      );
      if (
        reference.coinbase !== undefined ||
        inputTxId === '00'.repeat(32) ||
        typeof reference.txid !== 'string' ||
        reference.txid.toLowerCase() !== inputTxId ||
        reference.vout !== input.outpointIndex
      )
        return undefined;
      if (
        !decoded.outputs.every((output, index) =>
          bitcoinCashOutputMatchesRpc(output, transaction.vout[index], index),
        )
      )
        return undefined;

      const locks = decoded.outputs.filter(
        (output) =>
          Buffer.from(output.lockingBytecode).toString('hex') ===
          this.lockScriptPubKey,
      );
      if (
        locks.length !== 1 ||
        locks[0].token ||
        locks[0].valueSatoshis <= 0n ||
        locks[0].valueSatoshis > 0xffffffffffffffffn
      )
        return undefined;

      const candidates = decoded.outputs.flatMap((output) => {
        if (output.lockingBytecode[0] !== 0x6a || output.token) return [];
        const rawData = Buffer.from(output.lockingBytecode).toString('hex');
        try {
          return [{ ...parseBitcoinCashOpReturn(rawData), rawData }];
        } catch {
          return [];
        }
      });
      if (candidates.length !== 1) return undefined;
      const data = candidates[0];
      const transformation = this.getAssetTransformation(
        locks[0].valueSatoshis,
        data.toChain,
      );
      if (!transformation) return undefined;
      return {
        ...data,
        fromAddress: `box:${inputTxId}.${input.outpointIndex}`,
        sourceChainTokenId: transformation.from,
        amount: transformation.amount,
        targetChainTokenId: transformation.to,
        sourceTxId: transaction.txid.toLowerCase(),
      };
    } catch (error) {
      this.logger.debug(
        `Failed to extract native Bitcoin Cash Rosen data: ${error}`,
      );
      return undefined;
    }
  };

  /**
   * Resolve the native asset's configured destination without wrapping twice.
   * @param amount raw integer satoshis authenticated by extraction
   * @param toChain assigned destination parsed from Rosen metadata
   * @returns raw source amount and token identities, or undefined if unmapped
   */
  getAssetTransformation = (
    amount: bigint,
    toChain: string,
  ): TokenTransformation | undefined => {
    if (amount <= 0n || amount > 0xffffffffffffffffn) return undefined;
    const token = this.tokens.search(this.chain, {
      tokenId: BITCOIN_CASH_NATIVE_TOKEN,
    })[0];
    if (!token || !Object.hasOwn(token, toChain)) return undefined;
    return {
      from: BITCOIN_CASH_NATIVE_TOKEN,
      to: this.tokens.getID(token, toChain),
      amount: amount.toString(),
    };
  };
}
