import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { NodeTransaction } from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { Transaction } from 'ergo-lib-wasm-nodejs';
import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { ErgoNodeRosenExtractor } from './ErgoNodeRosenExtractor';
import JsonBigInt from '@rosen-bridge/json-bigint';

export class ErgoRosenExtractor extends AbstractRosenDataExtractor<string> {
  private nodeExtractor: ErgoNodeRosenExtractor;

  constructor(
    lockAddress: string,
    tokens: RosenTokens,
    logger?: AbstractLogger
  ) {
    super(lockAddress, tokens, logger);
    this.nodeExtractor = new ErgoNodeRosenExtractor(
      lockAddress,
      tokens,
      logger
    );
  }

  /**
   * extracts RosenData from given lock transaction in wasm sigma serialized bytes
   * @param serializedTransaction the sigma serialized bytes of transaction
   */
  get = (serializedTransaction: string): RosenData | undefined => {
    let transaction: Transaction;
    try {
      transaction = Transaction.sigma_parse_bytes(
        Buffer.from(serializedTransaction, 'hex')
      );
    } catch (e) {
      this.logger.debug(
        `An error occurred while deserializing Ergo tx to extract rosen data: ${e}`
      );
      if (e instanceof Error && e.stack) {
        this.logger.debug(e.stack);
      }
      return undefined;
    }
    const nodeTx = JsonBigInt.parse(transaction.to_json()) as NodeTransaction;
    return this.nodeExtractor.get(nodeTx);
  };
}
