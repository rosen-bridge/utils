import { RosenData } from '../abstract/types';
import AbstractRosenDataExtractor from '../abstract/AbstractRosenDataExtractor';
import { NodeTransaction } from './types';
import { RosenTokens } from '@rosen-bridge/tokens';
import { Transaction } from 'ergo-lib-wasm-nodejs';
import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { ErgoNodeRosenExtractor } from './ErgoNodeRosenExtractor';
import { JsonBI } from '@rosen-bridge/minimum-fee/dist/lib/network/parser';

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
   * extracts RosenData from given lock transaction in Node format
   * @param serializedTransaction the sigma serialize bytes of transaction
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
    const nodeTx = JsonBI.parse(transaction.to_json()) as NodeTransaction;
    return this.nodeExtractor.get(nodeTx);
  };
}
