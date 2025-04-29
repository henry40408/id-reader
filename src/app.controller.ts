import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
} from '@nestjs/terminus';

@Controller()
export class AppController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('healthz')
  @HealthCheck()
  healthz(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }
}
