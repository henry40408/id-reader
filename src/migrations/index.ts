import type { Knex } from 'knex';

import * as m20250430115720_initial from './m20250430115720_initial';

type MyMigration = Knex.Migration & { name: string };

const MIGRATIONS: MyMigration[] = [m20250430115720_initial];

export class MyMigrationSource implements Knex.MigrationSource<string> {
  getMigrations(): Promise<string[]> {
    return Promise.resolve([m20250430115720_initial.name]);
  }

  getMigrationName(migration: string): string {
    return migration;
  }

  getMigration(migration: string): Promise<Knex.Migration> {
    const m = MIGRATIONS.find((m) => m.name === migration);
    if (!m) throw new Error(`unexpected migration ${migration}`);
    return Promise.resolve(m);
  }
}
