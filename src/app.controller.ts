import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly typeorm: TypeOrmHealthIndicator,
  ) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([() => this.typeorm.pingCheck('db')]);
  }
}
