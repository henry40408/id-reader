import { Module, Provider } from '@nestjs/common';
import knex, { Knex } from 'knex';
import { TerminusModule } from '@nestjs/terminus';
import { KNEX } from './knex.constant';
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './knex.module-definition';
import { ConfigModuleOptions } from './knex.interface';
import { KnexHealthIndicator } from './knex.health';
import { MyMigrationSource } from './migrations/source';
import { PragmaService } from './pragma.service';
import { MigrationService } from './migration.service';
import { UserRepository } from './repository/user.repository';

const repositories: Provider[] = [UserRepository];

const connectionProvider: Provider = {
  provide: KNEX,
  inject: [MODULE_OPTIONS_TOKEN],
  useFactory: (_options: ConfigModuleOptions) => {
    const options: Knex.Config = _options.knex;
    if (!options.migrations) options.migrations = {};
    if (!options.migrations.migrationSource) options.migrations.migrationSource = new MyMigrationSource();
    return knex.default(options);
  },
};

@Module({
  imports: [TerminusModule],
  providers: [connectionProvider, KnexHealthIndicator, MigrationService, PragmaService, ...repositories],
  exports: [KNEX, KnexHealthIndicator],
})
export class KnexModule extends ConfigurableModuleClass {}
