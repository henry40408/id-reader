import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import knex from 'knex';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './knex.module-definition';
import { KnexHealthIndicator } from './knex.health';
import { PragmaService } from './pragma.service';
import { IConfigModuleOptions } from './knex.interface';
import { getKnexToken } from './knex.constant';

@Module({
  imports: [TerminusModule],
  providers: [
    {
      provide: getKnexToken(),
      inject: [MODULE_OPTIONS_TOKEN],
      useFactory: (config: IConfigModuleOptions) => knex.default(config.knex),
    },
    KnexHealthIndicator,
    PragmaService,
  ],
  exports: [getKnexToken(), KnexHealthIndicator],
})
export class KnexModule extends ConfigurableModuleClass {}
