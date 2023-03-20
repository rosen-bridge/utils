import { DataSource } from 'typeorm';
import createAtomicQueryRunner from '../lib';

const createAndInitializeDataSource = async () => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    dropSchema: true,
    entities: [],
    synchronize: true,
    logging: false,
  });
  await dataSource.initialize();

  return dataSource;
};

describe('createAtomicQueryRunner', () => {
  /**
   * @target `createAtomicQueryRunner` should handle successful transactions
   *  correctly
   * @dependencies
   * @scenario
   * - create a data source and initialize it
   * - create two functions which run a successful transaction using a query
   *   runner
   * - call both of the functions simultaneously
   * @expected
   * - simultaneous call should not throw
   */
  it('should handle successful transactions correctly', async () => {
    const dataSource = await createAndInitializeDataSource();

    const runFirstTransaction = async () => {
      const queryRunner = createAtomicQueryRunner(dataSource);
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.commitTransaction();
      await queryRunner.release();
    };
    const runSecondTransaction = async () => {
      const queryRunner = createAtomicQueryRunner(dataSource);
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.commitTransaction();
      await queryRunner.release();
    };

    await expect(
      Promise.all([runFirstTransaction(), runSecondTransaction()])
    ).resolves.not.toThrow(Error);
  });

  /**
   * @target `createAtomicQueryRunner` should handle failed transactions
   * correctly
   * @dependencies
   * @scenario
   * - create a data source and initialize it
   * - create two functions which run a failed transaction using a query runner
   * - call both of the functions simultaneously
   * @expected
   * - simultaneous calls should not throw
   */
  it('should handle failed transactions correctly', async () => {
    const dataSource = await createAndInitializeDataSource();

    const runFirstTransaction = async () => {
      const queryRunner = createAtomicQueryRunner(dataSource);
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    };
    const runSecondTransaction = async () => {
      const queryRunner = createAtomicQueryRunner(dataSource);
      await queryRunner.connect();
      await queryRunner.startTransaction();
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    };

    await expect(
      Promise.all([runFirstTransaction(), runSecondTransaction()])
    ).resolves.not.toThrow(Error);
  });

  /**
   * @target `createAtomicQueryRunner` should throw an error if
   * `commitTransaction` is called before `startTransaction`
   * @dependencies
   * @scenario
   * - create a data source and initialize it
   * - create a function which runs a transaction partially using a query
   *   runner, but runs `commitTransaction` before `startTransaction`
   * - call the function
   * @expected
   * - the function should throw
   */
  it('should throw an error if `commitTransaction` is called before `startTransaction`', async () => {
    const dataSource = await createAndInitializeDataSource();

    const runTransaction = async () => {
      const queryRunner = createAtomicQueryRunner(dataSource);
      await queryRunner.connect();
      await queryRunner.commitTransaction();
      await queryRunner.startTransaction();
    };

    await expect(runTransaction()).rejects.toThrow(Error);
  });

  /**
   * @target `createAtomicQueryRunner` should throw an error if
   * `rollbackTransaction` is called before `startTransaction`
   * @dependencies
   * @scenario
   * - create a data source and initialize it
   * - create a function which runs a transaction partially using a query
   *   runner, but runs `rollbackTransaction` before `startTransaction`
   * - call the function
   * @expected
   * - the function should throw
   */
  it('should throw an error if `rollbackTransaction` is called before `startTransaction`', async () => {
    const dataSource = await createAndInitializeDataSource();

    const runTransaction = async () => {
      const queryRunner = createAtomicQueryRunner(dataSource);
      await queryRunner.connect();
      await queryRunner.rollbackTransaction();
      await queryRunner.startTransaction();
    };

    await expect(runTransaction()).rejects.toThrow(Error);
  });

  /**
   * @target `createAtomicQueryRunner` should  not omit typeorm queryRunner
   * delegated properties
   * @dependencies
   * @scenario
   * - create a data source and initialize it
   * - create a query runner
   * @expected
   * - query runner should have `release` delegated property
   */
  it('should not omit typeorm queryRunner delegated properties', async () => {
    const dataSource = await createAndInitializeDataSource();

    const queryRunner = createAtomicQueryRunner(dataSource);

    expect(queryRunner).toHaveProperty('release');
  });
});
