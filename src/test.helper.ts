import { MyMigrationSource } from './migrations';

export const knexConfig = {
  knex: {
    client: 'better-sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    migrations: { migrationSource: new MyMigrationSource() },
  },
};
