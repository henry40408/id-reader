import { IConfigModuleOptions } from './knex/knex.interface';
import { MyMigrationSource } from './migrations';

export const knexConfig: IConfigModuleOptions = {
  knex: {
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    migrations: { migrationSource: new MyMigrationSource() },
  },
};
