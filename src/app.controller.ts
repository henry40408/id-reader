import { Controller, Get } from '@nestjs/common';
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
  async healthz(): Promise<HealthCheckResult> {
    return await this.health.check([]);
  }
}
