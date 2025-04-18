import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  env: string;
  is: {
    development: boolean;
    test: boolean;
    production: boolean;
  };
}

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get config(): AppConfig {
    const env = this.configService.getOrThrow<string>('NODE_ENV', 'development');
    return {
      env,
      is: {
        development: 'development' === env,
        production: 'production' === env,
        test: 'test' === env,
      },
    };
  }
}
