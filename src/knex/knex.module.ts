import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import knex from 'knex';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './knex.module-definition';
import { KnexHealthIndicator } from './knex.health';
import { PragmaService } from './pragma.service';
import { ConfigModuleOptions } from './knex.interface';
import { KNEX } from './knex.constant';

@Module({
  imports: [TerminusModule],
  providers: [
    {
      provide: KNEX,
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (config: ConfigModuleOptions) => knex.default(config.knex),
    },
    KnexHealthIndicator,
    PragmaService,
  ],
  exports: [KNEX, KnexHealthIndicator],
})
export class KnexModule extends ConfigurableModuleClass {}
