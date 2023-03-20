import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver';
import { Mutex } from 'async-mutex';
import { DataSource, QueryRunner, ReplicationMode } from 'typeorm';
import AtomicTransactionQueryRunner from './AtomicTransactionQueryRunner';

class AtomicTransactionSqliteDriver extends SqliteDriver {
  protected mutex: Mutex;

  constructor(connection: DataSource) {
    super(connection);
    this.mutex = new Mutex();
  }

  createQueryRunner = (mode: ReplicationMode): QueryRunner => {
    if (!this.queryRunner)
      this.queryRunner = new AtomicTransactionQueryRunner(this, this.mutex);
    return this.queryRunner;
  };
}

export default AtomicTransactionSqliteDriver;
