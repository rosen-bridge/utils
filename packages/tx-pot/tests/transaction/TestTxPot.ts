import { DataSource } from 'typeorm';
import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { TransactionEntity, TransactionStatus, TxPot } from '../../lib';

export class TestTxPot extends TxPot {
  protected static instance: TestTxPot;

  public static setup = (
    dataSource: DataSource,
    logger?: AbstractLogger
  ): TestTxPot => {
    TestTxPot.instance = new TestTxPot(dataSource, logger);
    return TestTxPot.instance;
  };

  callSetTransactionAsInvalid = async (tx: TransactionEntity): Promise<void> =>
    this.setTransactionAsInvalid(tx);

  callValidateTx = async (tx: TransactionEntity): Promise<boolean> =>
    this.validateTx(tx);

  callSetTxStatus = async (
    tx: TransactionEntity,
    status: TransactionStatus
  ): Promise<void> => this.setTxStatus(tx, status);

  callProcessSignedTx = async (tx: TransactionEntity): Promise<void> =>
    this.processSignedTx(tx);

  callProcessesSentTx = async (tx: TransactionEntity): Promise<void> =>
    this.processesSentTx(tx);
}
