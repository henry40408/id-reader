import { DynamicModule } from '@nestjs/common';
import { KnexModule } from './knex/knex.module';

export function testKnexModule(): DynamicModule {
  return KnexModule.register({
    knex: {
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    },
  });
}
