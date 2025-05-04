import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(private health: HealthCheckService) {}

  @Get('healthz')
  @HealthCheck()
  @ApiOperation({ summary: 'Check health' })
  async healthz(): Promise<HealthCheckResult> {
    return await this.health.check([]);
  }
}
