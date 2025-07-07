import { Injectable, OnModuleInit } from '@nestjs/common';
import { type ViteDevServer } from 'vite';
import { AppConfigService } from './app-config.module';

@Injectable()
export class ViteService implements OnModuleInit {
  private vite: ViteDevServer | undefined;

  constructor(private readonly appConfigService: AppConfigService) {}

  async onModuleInit() {
    if (!this.appConfigService.config.appEnv.development) return;
    const { createServer } = await import('vite');
    this.vite = await createServer({
      clearScreen: false,
      configFile: 'vite.config.mts',
      root: 'app',
      server: { middlewareMode: true },
    });
  }

  async onModuleDestroy() {
    if (this.vite) await this.vite.close();
  }

  get middlewares() {
    return this.vite?.middlewares;
  }
}
