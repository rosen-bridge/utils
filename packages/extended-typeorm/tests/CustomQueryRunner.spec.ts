import { createAndInitializeDataSource } from './CustomQueryRunnerTestUtils';

describe('CustomQueryRunner', () => {
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
  });
});
