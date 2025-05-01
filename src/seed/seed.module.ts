import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { KnexModule } from '../knex/knex.module';
import { MyMigrationSource } from '../migrations';
import { UserRepository } from '../repositories/user.repository';
import { SeedService } from './seed.service';

@Module({
  imports: [
    AppConfigModule,
    KnexModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        knex: {
          client: 'better-sqlite3',
          connection: {
            filename: configService.config.databaseUrl,
          },
          useNullAsDefault: true,
          migrations: {
            migrationSource: new MyMigrationSource(),
          },
        },
      }),
    }),
  ],
  providers: [UserRepository, SeedService],
  exports: [UserRepository, SeedService],
})
export class SeedModule {}
