import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { TokenMap } from '@rosen-bridge/tokens';

import AbstractRosenDataExtractor from '../abstract/abstractRosenDataExtractor';
import { RosenData } from '../abstract/types';
import { BITCOIN_CASH_CHAIN } from '../const';
import { BitcoinCashRpcRosenExtractor } from './bitcoinCashRpcRosenExtractor';
import { BitcoinCashRpcTransaction } from './types';

/** Extracts native BCH deposits from the chain's serialized transaction type. */
export class BitcoinCashRosenExtractor extends AbstractRosenDataExtractor<string> {
  readonly chain = BITCOIN_CASH_CHAIN;
  private readonly rpc: BitcoinCashRpcRosenExtractor;

  /**
   * Uses the network extractor's raw-byte checks for the universal chain format.
   * @param lockAddress canonical mainnet treasury CashAddr
   * @param tokens native BCH and destination asset mappings
   * @param logger extraction diagnostics; omission uses the inherited DummyLogger
   * @param storeRawData whether get retains the Rosen OP_RETURN bytes; defaults to true
   */
  constructor(
    lockAddress: string,
    tokens: TokenMap,
    logger?: AbstractLogger,
    storeRawData = true,
  ) {
    super(lockAddress, tokens, logger, storeRawData);
    this.rpc = new BitcoinCashRpcRosenExtractor(lockAddress, tokens, logger);
  }

  /**
   * Parses the chain transport and authenticates its raw bytes and RPC fields.
   * The inherited get method wraps the extracted amount exactly once.
   * @param serializedTransaction JSON of BitcoinCashRpcTransaction
   * @returns extracted Rosen fields, or undefined for an invalid transaction
   * @throws SyntaxError when the chain transport is not valid JSON
   */
  extractData = (serializedTransaction: string): RosenData | undefined => {
    const transaction: BitcoinCashRpcTransaction = JSON.parse(
      serializedTransaction,
    );
    return this.rpc.extractData(transaction);
  };
}
