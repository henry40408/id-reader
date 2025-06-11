import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { milliseconds, millisecondsToSeconds } from 'date-fns';

export interface AppEnv {
  production: boolean;
  development: boolean;
  test: boolean;
}

export interface JwtConfig {
  secret: string;
  expiresIn: number; // in seconds
}

export interface AppConfig {
  appEnv: AppEnv;
  databaseUrl: string;
  jwt: JwtConfig;
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get config(): AppConfig {
    return {
      appEnv: this.appEnv,
      databaseUrl: this.databaseUrl,
      jwt: {
        secret: this.configService.getOrThrow<string>('JWT_SECRET', 'secret'),
        expiresIn: this.configService.getOrThrow<number>(
          'JWT_EXPIRES_IN',
          millisecondsToSeconds(milliseconds({ days: 7 })),
        ),
      },
    };
  }

  private get appEnv(): AppEnv {
    const env = this.env;
    return {
      development: env === 'development',
      production: env === 'production',
      test: env === 'test',
    };
  }

  private get env(): string {
    return this.configService.getOrThrow<string>('NODE_ENV', 'development');
  }

  private get databaseUrl(): string {
    if (this.appEnv.test) return ':memory:';
    return this.configService.getOrThrow<string>('DATABASE_URL', 'development.sqlite3');
  }
}

@Module({
  imports: [ConfigModule],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
