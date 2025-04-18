import { All, Controller, Get, NotFoundException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ViteService } from './vite.service';

@Controller()
export class AppController {
  constructor(private readonly viteService: ViteService) {}

  @Get('healthz')
  healthz() {
    return '';
  }

  @All('*')
  catchCall(@Req() req: Request, @Res() res: Response) {
    const middlewares = this.viteService.middlewares;
    if (!middlewares) throw new NotFoundException();
    return middlewares(req, res);
  }
}
