import { Knex } from 'knex';
import * as m20250430115720Initial from './m20250430115720_initial';

export class MyMigrationSource implements Knex.MigrationSource<string> {
  getMigrations() {
    return Promise.resolve([m20250430115720Initial.name]);
  }

  getMigrationName(migration: string) {
    return migration;
  }

  getMigration(migration: string) {
    switch (migration) {
      case m20250430115720Initial.name:
        return Promise.resolve(m20250430115720Initial);
      default:
        throw new Error(`Migration ${migration} not found`);
    }
  }
}
