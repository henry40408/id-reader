import { All, Controller, Get, NotFoundException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ViteService } from './vite.service';

@Controller()
export class AppController {
  constructor(private readonly viteService: ViteService) {}

  @ApiOperation({ summary: 'check health' })
  @ApiOkResponse({ description: 'service is up' })
  @Get('healthz')
  healthz() {
    return '';
  }

  @ApiOperation({ summary: 'catch-all endpoint to Vite dev server in development environment' })
  @All('*')
  catchCall(@Req() req: Request, @Res() res: Response) {
    const middlewares = this.viteService.middlewares;
    if (!middlewares) throw new NotFoundException();
    return middlewares(req, res);
  }
}
