import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectKnex } from './knex.constant';

@Injectable()
export class PragmaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PragmaService.name);

  constructor(@InjectKnex() private readonly knex: Knex) {}

  async onModuleInit() {
    await this.knex.raw('PRAGMA foreign_keys = ON');
    this.logger.log('Foreign keys enabled');

    await this.knex.raw('PRAGMA journal_mode = WAL');
    this.logger.log('Journal mode set to WAL');

    await this.knex.raw('PRAGMA synchronous = NORMAL');
    this.logger.log('Synchronous mode set to NORMAL');
  }

  async onModuleDestroy() {
    await this.knex.raw('PRAGMA analysis_limit = 400');
    this.logger.log('Analysis limit set to 400');

    await this.knex.raw('PRAGMA optimize');
    this.logger.log('Optimized database');

    await this.knex.destroy();
    this.logger.log('Knex connection closed');
  }
}
