import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { AppConfigService } from './app-config/app-config.service';
import { MyMigrationSource } from './migrations/source';

@Injectable()
export class KnexService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KnexService.name);

  private knex: Knex | undefined;

  constructor(private readonly appConfigService: AppConfigService) {}

  async onModuleInit() {
    this.knex = knex.default({
      client: 'sqlite',
      connection: { filename: this.appConfigService.config.databaseUrl },
      migrations: {
        migrationSource: new MyMigrationSource(),
      },
      useNullAsDefault: true,
    });

    await this.knex.raw('PRAGMA foreign_keys = ON');
    this.logger.log('Foreign keys enabled');

    await this.knex.raw('PRAGMA journal_mode = WAL');
    this.logger.log('Journal mode set to WAL');

    await this.knex.raw('PRAGMA synchronous = NORMAL');
    this.logger.log('Synchronous mode set to NORMAL');

    await this.knex.migrate.latest();
    this.logger.log('Migrations applied');
  }

  async onModuleDestroy() {
    if (!this.knex) return;

    await this.knex.raw('PRAGMA analysis_limit = 400');
    this.logger.log('Analysis limit set to 400');

    await this.knex.raw('PRAGMA optimize');
    this.logger.log('Optimized database');

    await this.knex.destroy();
    this.logger.log('Knex connection closed');
  }

  get connection(): Knex {
    if (!this.knex) throw new Error('knex is has not been initialized');
    return this.knex;
  }
}
