import path from 'node:path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { createServer, ViteDevServer } from 'vite';
import { AppConfigService } from './app-config.service';

@Injectable()
export class ViteService implements OnModuleInit {
  private viteServer: ViteDevServer | null;

  constructor(private readonly configService: AppConfigService) {}

  async onModuleInit() {
    if (this.configService.config.is.development) {
      this.viteServer = await createServer({
        configFile: 'vite.config.mts',
        server: { middlewareMode: true },
        appType: 'spa',
        root: path.resolve(__dirname, '../app'),
      });
    }
  }

  get middlewares() {
    return this.viteServer?.middlewares;
  }
}
