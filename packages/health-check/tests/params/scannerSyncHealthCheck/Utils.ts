import { DataSource } from 'typeorm';
import {
  BlockEntity,
  PROCEED,
  migrations as scannerMigrations,
} from '@rosen-bridge/scanner';

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

  const ergoBlockEntity = new BlockEntity();
  ergoBlockEntity.scanner = 'scannerName';
  ergoBlockEntity.id = 1;
  ergoBlockEntity.hash = 'blockHash';
  ergoBlockEntity.height = 1111;
  ergoBlockEntity.parentHash = 'parentHash';
  ergoBlockEntity.status = PROCEED;
  ergoBlockEntity.timestamp = 12345;
  await dataSource.getRepository(BlockEntity).insert([ergoBlockEntity]);

  return dataSource;
};

export { createDataSource };
