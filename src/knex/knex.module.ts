import * as fs from 'node:fs/promises';
import { Inject, Logger, Module, OnModuleDestroy, OnModuleInit, Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import * as knex from 'knex';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { KNEX } from './knex.constant';
import { KnexHealthIndicator } from './knex.health-check.service';
import { ConfigModuleOptions } from './knex.interface';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './knex.module-definition';

const connectionProvider: Provider = {
  provide: KNEX,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (config: ConfigModuleOptions) => knex.default(config.knex),
};

@Module({
  imports: [AppConfigModule, TerminusModule],
  providers: [connectionProvider, KnexHealthIndicator],
  exports: [connectionProvider, KnexHealthIndicator],
})
export class KnexModule extends ConfigurableModuleClass implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KnexModule.name);

  constructor(
    private readonly configService: AppConfigService,
    @Inject(KNEX) private readonly knex: knex.Knex,
  ) {
    super();
  }

  async onModuleInit() {
    if (this.configService.config.env.production) return;
    if (this.configService.config.env.development) {
      await fs.mkdir('.temp', { recursive: true });
      this.logger.log('.temp directory created');
    }
    await this.knex.migrate.latest();
    this.logger.log('database migrated');
  }

  async onModuleDestroy() {
    await this.knex.destroy();
    this.logger.log('database connection destroyed');
  }
}
