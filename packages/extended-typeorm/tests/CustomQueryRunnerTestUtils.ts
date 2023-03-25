import { DataSource } from '../lib';

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

export { createAndInitializeDataSource };
