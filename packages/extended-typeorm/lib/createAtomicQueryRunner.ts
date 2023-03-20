import { DataSource, QueryRunner } from 'typeorm';

import { Mutex, MutexInterface } from 'async-mutex';

const mutex = new Mutex();

const createAtomicQueryRunner = (dataSource: DataSource) => {
  let releaseMutex: MutexInterface.Releaser | null;

  const queryRunner = dataSource.createQueryRunner();

  const startTransaction = async () => {
    releaseMutex = await mutex.acquire();
    return queryRunner.startTransaction();
  };

  const commitTransaction = async () => {
    if (!releaseMutex) {
      throw new Error('Cannot commit transaction before starting it');
    }

    await queryRunner.commitTransaction();
    releaseMutex();
    releaseMutex = null;
  };

  const rollbackTransaction = async () => {
    if (!releaseMutex) {
      throw new Error('Cannot rollback transaction before starting it');
    }

    await queryRunner.rollbackTransaction();
    releaseMutex();
    releaseMutex = null;
  };

  const connect = async () => {
    /**
     * If the transaction is not active, make sure no two simultaneous calls to
     * `connect` happen by waiting for the mutex before calling `connect`
     */
    if (!queryRunner.isTransactionActive) {
      (await mutex.acquire())();
    }
    queryRunner.connect();
  };

  const atomicQueryRunner = {
    startTransaction,
    commitTransaction,
    rollbackTransaction,
    connect,
  };
  Object.setPrototypeOf(atomicQueryRunner, queryRunner);

  return atomicQueryRunner as QueryRunner;
};

export default createAtomicQueryRunner;
