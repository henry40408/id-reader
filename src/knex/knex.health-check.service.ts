import { Inject, Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { Knex } from 'knex';
import { KNEX } from './knex.constant';

@Injectable()
export class KnexHealthIndicator {
  private readonly logger = new Logger(KnexHealthIndicator.name);

  constructor(
    private readonly health: HealthIndicatorService,
    @Inject(KNEX) private readonly knex: Knex,
  ) {}

  async check(key: string) {
    const indicator = this.health.check(key);
    try {
      await this.knex.raw('SELECT 1');
      return indicator.up();
    } catch (err) {
      this.logger.error(err);
      return indicator.down(err);
    }
  }
}
