import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX } from './knex.constant';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async onModuleInit() {
    await this.knex.migrate.latest();
    this.logger.log('Migrations applied');
  }
}
