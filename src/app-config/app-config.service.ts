import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { millisecondsToSeconds, milliseconds } from 'date-fns';
import { AppConfig, AppEnv, JwtConfig } from './app-config.interface';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get config(): AppConfig {
    return {
      databaseUrl: this.databaseUrl,
      env: this.appEnv,
      jwt: this.jwtConfig,
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
    if (this.appEnv.test) return ':memory:';
    if (this.appEnv.production) return this.configService.getOrThrow<string>(key);
    return this.configService.getOrThrow<string>(key, 'development.sqlite3');
  }

  private get env(): string {
    return this.configService.get('NODE_ENV', 'development');
  }

  private get jwtConfig(): JwtConfig {
    return {
      secret: this.jwtSecret,
      expiresInSeconds: this.jwtExpiresInSeconds,
    };
  }

  private get jwtSecret(): string {
    const key = 'JWT_SECRET';
    if (this.appEnv.production) return this.configService.getOrThrow<string>(key);
    return this.configService.getOrThrow<string>(key, 'secret');
  }

  private get jwtExpiresInSeconds(): number {
    return this.configService.getOrThrow<number>(
      'JWT_EXPIRES_IN_SECONDS',
      millisecondsToSeconds(milliseconds({ days: 7 })),
    );
  }
}
