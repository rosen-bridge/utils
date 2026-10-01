import { Mutex } from 'async-mutex';
import { DataSource, QueryRunner, ReplicationMode } from 'typeorm';
import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver.js';

import { CustomQueryRunner } from './customQueryRunner.js';

class CustomSqliteDriver extends SqliteDriver {
  protected mutex: Mutex;

  constructor(connection: DataSource) {
    super(connection);
    this.mutex = new Mutex();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createQueryRunner = (mode: ReplicationMode): QueryRunner => {
    if (!this.queryRunner)
      this.queryRunner = new CustomQueryRunner(this, this.mutex);
    return this.queryRunner;
  };
}

export { CustomSqliteDriver as SqliteDriver };
