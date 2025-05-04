import { Module, Provider } from '@nestjs/common';
import knex from 'knex';
import { TerminusModule } from '@nestjs/terminus';
import { KNEX } from './knex.constant';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './knex.module-definition';
import { ConfigModuleOptions } from './knex.interface';
import { KnexHealthIndicator } from './knex.health';

const connectionProvider: Provider = {
  provide: KNEX,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (options: ConfigModuleOptions) => {
    return knex.default(options.knex);
  },
};

@Module({
  imports: [TerminusModule],
  providers: [connectionProvider, KnexHealthIndicator],
  exports: [KNEX, KnexHealthIndicator],
})
export class KnexModule extends ConfigurableModuleClass {}
