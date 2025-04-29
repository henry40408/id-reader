import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { createServer, ViteDevServer } from 'vite';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class ViteService {
  private vite: ViteDevServer | undefined;

  constructor(private readonly configService: AppConfigService) {}

  async onModuleInit() {
    if (!this.configService.config.env.development) return;
    this.vite = await createServer({
      appType: 'spa',
      configFile: path.resolve(__dirname, '../../vite.config.mts'),
      root: path.resolve(__dirname, '../..'),
      server: { middlewareMode: true },
    });
  }

  get middlewares() {
    return this.vite?.middlewares;
  }
}
