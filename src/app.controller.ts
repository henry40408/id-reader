import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { OrmHealthIndicator } from './orm/orm.health';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly orm: OrmHealthIndicator,
  ) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([() => this.orm.pingCheck('db')]);
  }
}
