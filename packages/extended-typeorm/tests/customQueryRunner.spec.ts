import { CustomQueryRunner } from '../lib/customQueryRunner';
import { createAndInitializeDataSource } from './customQueryRunnerTestUtils';

describe('CustomQueryRunner', () => {
  describe('startTransaction', () => {
    /**
     * @target CustomQueryRunner.startTransaction should release the mutex when starting a transaction fails
     * @dependencies
     * @scenario
     * - create a datasource
     * - create a query runner and connect to it
     * - call startTransaction with an isolation level SQLite does not support, so it throws after the mutex was acquired
     * - check the mutex state
     * - start and commit a valid transaction
     * @expected
     * - the failed start should throw
     * - the mutex should not be locked and no releaser should be kept after the failure
     * - the valid transaction should start and commit successfully
     */
    it('should release the mutex when starting a transaction fails', async () => {
      const dataSource = await createAndInitializeDataSource();
      const queryRunner = dataSource.createQueryRunner() as CustomQueryRunner;
      await queryRunner.connect();
      await expect(
        queryRunner.startTransaction('READ COMMITTED'),
      ).rejects.toThrow();
      expect(queryRunner.releaseMutex).toEqual(null);
      expect(queryRunner.mutex.isLocked()).toEqual(false);

      await queryRunner.startTransaction();
      await queryRunner.commitTransaction();
      expect(queryRunner.releaseMutex).toEqual(null);
      expect(queryRunner.mutex.isLocked()).toEqual(false);
    });
  });

  describe('commitTransaction', () => {
    /**
     * @target CustomQueryRunner.commitTransaction should throw Error when no transaction started
     * @dependencies
     * @scenario
     * - create a datasource
     * - create a query runner and connect to it
     * - call commitTransaction on it
     * @expected
     * - throw an error
     */
    it('should throw Error when no transaction started', async () => {
      const dataSource = await createAndInitializeDataSource();
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await expect(() => queryRunner.commitTransaction()).rejects.toThrow();
    });
  });

  describe('rollbackTransaction', () => {
    /**
     * @target CustomQueryRunner.rollbackTransaction should throw Error when no transaction started
     * @dependencies
     * @scenario
     * - create a datasource
     * - create a query runner and connect to it
     * - call rollbackTransaction on it
     * @expected
     * - throw an error
     */
    it('should throw Error when no transaction started', async () => {
      const dataSource = await createAndInitializeDataSource();
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await expect(() => queryRunner.rollbackTransaction()).rejects.toThrow();
    });

    /**
     * @target CustomQueryRunner.rollbackTransaction should release the mutex when the rollback fails
     * @dependencies
     * @scenario
     * - create a datasource
     * - create a query runner and connect to it
     * - start a transaction
     * - end the transaction with a raw COMMIT so the rollback fails in SQLite
     * - call rollbackTransaction
     * - check the mutex state
     * @expected
     * - the rollback should throw
     * - the mutex should not be locked and no releaser should be kept after the failure
     */
    it('should release the mutex when the rollback fails', async () => {
      const dataSource = await createAndInitializeDataSource();
      const queryRunner = dataSource.createQueryRunner() as CustomQueryRunner;
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.query('COMMIT');
      await expect(queryRunner.rollbackTransaction()).rejects.toThrow();
      expect(queryRunner.releaseMutex).toEqual(null);
      expect(queryRunner.mutex.isLocked()).toEqual(false);
    });
  });
});
