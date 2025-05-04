import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, AppEnv } from './app-config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get config(): AppConfig {
    return {
      databaseUrl: this.databaseUrl,
      env: this.appEnv,
    };
  }

  private get appEnv(): AppEnv {
    return {
      development: this.env === 'development',
      test: this.env === 'test',
      production: this.env === 'production',
    };
  }

  private get databaseUrl(): string {
    const key = 'DATABASE_URL';
    if (this.appEnv.production) return this.configService.getOrThrow<string>(key);
    return this.configService.getOrThrow<string>(key, 'development.sqlite3');
  }

  private get env(): string {
    return this.configService.get('NODE_ENV', 'development');
  }
}
