import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { KnexHealthIndicator } from './knex.health';

@Controller()
export class AppController {
  constructor(
    private health: HealthCheckService,
    private knexHealth: KnexHealthIndicator,
  ) {}

  @Get('healthz')
  @HealthCheck()
  @ApiOperation({ summary: 'Check health' })
  async healthz(): Promise<HealthCheckResult> {
    return await this.health.check([() => this.knexHealth.check('db')]);
  }
}
