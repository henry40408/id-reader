import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { Knex } from 'knex';
import { InjectKnex } from './knex.constant';

@Injectable()
export class KnexHealthIndicator {
  private readonly logger = new Logger(KnexHealthIndicator.name);

  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly health: HealthIndicatorService,
  ) {}

  async check(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);
    try {
      await this.knex.raw('SELECT 1');
      this.logger.log('Knex is healthy');
      return indicator.up();
    } catch (err) {
      this.logger.error(err);
      return indicator.down(err);
    }
  }
}
