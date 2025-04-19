import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppEnv {
  development: boolean;
  test: boolean;
  production: boolean;
}

export interface AppConfig {
  databaseUrl: string;
  env: string;
  is: AppEnv;
}

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get appEnv(): AppEnv {
    return {
      development: 'development' === this.env,
      production: 'production' === this.env,
      test: 'test' === this.env,
    };
  }

  get config(): AppConfig {
    return {
      databaseUrl: this.databaseUrl,
      env: this.env,
      is: this.appEnv,
    };
  }

  get databaseUrl(): string {
    const key = 'DATABASE_URL';
    if (this.appEnv.test) return ':memory:';
    if (this.appEnv.development) return this.configService.getOrThrow<string>(key, '.temp/development.sqlite3');
    return this.configService.getOrThrow<string>(key);
  }

  get env(): string {
    return this.configService.getOrThrow<string>('NODE_ENV', 'development');
  }
}
