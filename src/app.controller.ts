import { All, Controller, Get, Next, Req, Res } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { NextFunction, Request, Response } from 'express';
import { ViteService } from './vite/vite.service';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly vite: ViteService,
  ) {}

  @Get('healthz')
  @HealthCheck()
  healthz(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @All('*')
  spa(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    if (req.path.startsWith('/graphql')) return next();
    if (!this.vite.middlewares) return next();
    return this.vite.middlewares(req, res, next);
  }
}
