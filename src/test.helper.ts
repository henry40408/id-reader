import { DynamicModule } from '@nestjs/common';
import { KnexModule } from './knex/knex.module';
import { MyMigrationSource } from './migrations';

export function testKnexModule(): DynamicModule {
  return KnexModule.register({
    knex: {
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
      migrations: { migrationSource: new MyMigrationSource() },
    },
  });
}
