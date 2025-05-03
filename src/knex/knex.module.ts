import * as fs from 'node:fs/promises';
import { Inject, Logger, Module, OnModuleDestroy, OnModuleInit, Provider } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import * as knex from 'knex';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { KNEX } from './knex.constant';
import { KnexHealthIndicator } from './knex.health-check.service';
import { IConfigModuleOptions } from './knex.interface';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './knex.module-definition';

const connectionProvider: Provider = {
  provide: KNEX,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: async (config: IConfigModuleOptions) => {
    const knexInstance = knex.default(config.knex);
    await knexInstance.raw('PRAGMA foreign_keys = ON');
    return knexInstance;
  },
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
    {
      const [{ foreign_keys }] = await this.knex.raw<{ foreign_keys: number }[]>('PRAGMA foreign_keys');
      if (foreign_keys === 1) this.logger.log('foreign keys enabled');
    }
    await this.knex.migrate.latest();
    this.logger.log('database migrated');
  }

  async onModuleDestroy() {
    await this.knex.destroy();
    this.logger.log('database connection destroyed');
  }
}
