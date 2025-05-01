import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { millisecondsToSeconds, milliseconds } from 'date-fns';
import { AppConfig } from './app-config.interface';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get config(): AppConfig {
    return {
      databaseUrl: this.databaseUrl,
      env: this.appEnv,
      jwt: {
        secret: this.jwtSecret,
        expiresInSeconds: this.jwtExpiresInSeconds,
      },
    };
  }

  private get appEnv() {
    return {
      development: this.env === 'development',
      test: this.env === 'test',
      production: this.env === 'production',
    };
  }

  private get databaseUrl() {
    const key = 'DATABASE_URL';
    if (this.appEnv.test) return ':memory:';
    if (this.appEnv.production) return this.configService.getOrThrow<string>(key);
    return this.configService.getOrThrow<string>(key, '.temp/development.sqlite3');
  }

  private get env() {
    return this.configService.getOrThrow<string>('NODE_ENV', 'development');
  }

  private get jwtSecret() {
    const key = 'JWT_SECRET';
    if (this.appEnv.production) return this.configService.getOrThrow<string>(key);
    return this.configService.getOrThrow<string>(key, 'secret');
  }

  private get jwtExpiresInSeconds() {
    return this.configService.getOrThrow<number>(
      'JWT_EXPIRES_IN_SECONDS',
      millisecondsToSeconds(milliseconds({ days: 7 })),
    );
  }
}
