import { DataSource, DataSourceOptions } from 'typeorm';
import { SqliteDriver } from './SqliteDriver';

class CustomDataSource extends DataSource {
  constructor(options: DataSourceOptions) {
    super(options);
    if (options.type === 'sqlite') {
      this.driver = new SqliteDriver(this);
    }
  }
}

export { CustomDataSource as DataSource };
