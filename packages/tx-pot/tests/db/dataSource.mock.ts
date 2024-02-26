import { DataSource } from 'typeorm';
import { TransactionEntity, migrations } from '../../lib';

export const mockDataSource = async () => {
  const testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [TransactionEntity],
    migrations: [...migrations.sqlite],
    synchronize: false,
    logging: false,
  });

  await testDataSource.initialize();
  await testDataSource.runMigrations();

  return testDataSource;
};
