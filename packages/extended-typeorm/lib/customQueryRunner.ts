import { Mutex, MutexInterface } from 'async-mutex';
import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver';
import { SqliteQueryRunner } from 'typeorm/driver/sqlite/SqliteQueryRunner';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

class CustomQueryRunner extends SqliteQueryRunner {
  releaseMutex: MutexInterface.Releaser | null;
  readonly mutex: Mutex;

  constructor(driver: SqliteDriver, mutex: Mutex) {
    super(driver);
    this.mutex = mutex;
  }

  startTransaction = async (isolationLevel?: IsolationLevel): Promise<void> => {
    this.releaseMutex = await this.mutex.acquire();
    return super.startTransaction(isolationLevel);
  };

  commitTransaction = async (): Promise<void> => {
    if (!this.releaseMutex) {
      throw new Error('Cannot commit transaction before starting it');
    }
    await super.commitTransaction();
    this.releaseMutex();
    this.releaseMutex = null;
  };

  rollbackTransaction = async (): Promise<void> => {
    if (!this.releaseMutex) {
      throw new Error('Cannot rollback transaction before starting it');
    }
    await super.rollbackTransaction();
    this.releaseMutex();
    this.releaseMutex = null;
  };
}

export { CustomQueryRunner };
