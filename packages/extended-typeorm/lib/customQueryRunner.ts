import { Mutex, MutexInterface } from 'async-mutex';
import { SqliteDriver } from 'typeorm/driver/sqlite/SqliteDriver';
import { SqliteQueryRunner } from 'typeorm/driver/sqlite/SqliteQueryRunner';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

class CustomQueryRunner extends SqliteQueryRunner {
  releaseMutex: MutexInterface.Releaser | null = null;
  readonly mutex: Mutex;

  constructor(driver: SqliteDriver, mutex: Mutex) {
    super(driver);
    this.mutex = mutex;
  }

  startTransaction = async (isolationLevel?: IsolationLevel): Promise<void> => {
    const release = await this.mutex.acquire();
    try {
      await super.startTransaction(isolationLevel);
    } catch (e) {
      // the transaction never started, so nothing else can release the mutex
      release();
      throw e;
    }
    this.releaseMutex = release;
  };

  commitTransaction = async (): Promise<void> => {
    if (!this.releaseMutex) {
      throw new Error('Cannot commit transaction before starting it');
    }
    // the mutex is released only after a successful commit: when a commit
    // fails the transaction is still active, and the caller's rollback (e.g.
    // by EntityManager.transaction) is what ends it and releases the mutex
    await super.commitTransaction();
    this.releaseMutex();
    this.releaseMutex = null;
  };

  rollbackTransaction = async (): Promise<void> => {
    if (!this.releaseMutex) {
      throw new Error('Cannot rollback transaction before starting it');
    }
    try {
      await super.rollbackTransaction();
    } finally {
      // the transaction is over either way; keeping the mutex after a failed
      // rollback would block every later transaction on this runner forever
      this.releaseMutex();
      this.releaseMutex = null;
    }
  };
}

export { CustomQueryRunner };
