import { DataSource } from 'typeorm';
import {
  BlockEntity,
  migrations as scannerMigrations,
} from '@rosen-bridge/scanner';

/**
 * Creates a test datasource
 */
const createDataSource = async () => {
  const dataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    entities: [BlockEntity],
    migrations: [...scannerMigrations.sqlite],
    synchronize: false,
    logging: false,
  });
  await dataSource.initialize();
  await dataSource.runMigrations();

  return dataSource;
};

export { createDataSource };
