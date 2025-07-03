import { All, Controller, Get, Next, Req, Res } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { NextFunction, Request, Response } from 'express';
import { OrmHealthIndicator } from './orm/orm.health';
import { ViteService } from './vite.service';

@Controller()
export class AppController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly orm: OrmHealthIndicator,
    private readonly vite: ViteService,
  ) {}

  @ApiOperation({ summary: 'Health check endpoint' })
  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([() => this.orm.pingCheck('db')]);
  }

  @ApiOperation({ summary: 'Catch-all route for Vite middleware in development mode' })
  @All('/{*path}')
  catchAll(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    // If the request is for a GraphQL endpoint, skip Vite middleware
    if (req.url.startsWith('/graphql')) return next();

    const middlewares = this.vite.middlewares;
    if (!middlewares) return next();

    return this.vite.middlewares(req, res, next);
  }
}
