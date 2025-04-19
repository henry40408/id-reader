import { All, Controller, Get, NotFoundException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { ViteService } from './vite.service';

@Controller()
export class AppController {
  constructor(
    private readonly healthCheckService: HealthCheckService,
    private readonly viteService: ViteService,
  ) {}

  @Get('healthz')
  @ApiOperation({ summary: 'check health' })
  @HealthCheck()
  async healthz(): Promise<HealthCheckResult> {
    return await this.healthCheckService.check([]);
  }

  @ApiOperation({ summary: 'catch-all endpoint to Vite dev server in development environment' })
  @All('*')
  catchCall(@Req() req: Request, @Res() res: Response) {
    const middlewares = this.viteService.middlewares;
    if (!middlewares) throw new NotFoundException();
    return middlewares(req, res);
  }
}
