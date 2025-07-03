import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class OrmHealthIndicator {
  constructor(
    private readonly em: EntityManager,
    private readonly health: HealthIndicatorService,
  ) {}

  async pingCheck(key: string) {
    const indicator = this.health.check(key);
    try {
      await this.em.getConnection().execute('SELECT 1');
      return indicator.up();
    } catch (error) {
      return indicator.down(error);
    }
  }
}
