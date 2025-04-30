import { KnexModule } from './knex/knex.module';
import { MyMigrationSource } from './migrations';

export const testKnexModule = KnexModule.register({
  knex: {
    client: 'better-sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    migrations: { migrationSource: new MyMigrationSource() },
  },
});
