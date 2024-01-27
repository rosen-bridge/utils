import { Migration1706350644686 } from './postgres/1706350644686-migration';
import { Migration1706007154531 } from './sqlite/1706007154531-migration';

export default {
  sqlite: [Migration1706007154531],
  postgres: [Migration1706350644686],
};
