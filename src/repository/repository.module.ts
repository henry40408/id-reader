import { Module, Provider } from '@nestjs/common';
import { KnexModule } from '../knex/knex.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { CategoryRepository } from './repository/category.repository';
import { MigrationService } from './migration.service';
import { UserRepository } from './repository/user.repository';
import { MyMigrationSource } from './migrations/source';
import { ImageRepository } from './repository/image.repository';
import { FeedRepository } from './repository/feed.repository';

const repositories: Provider[] = [CategoryRepository, FeedRepository, ImageRepository, UserRepository];

@Module({
  imports: [
    KnexModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        knex: {
          client: 'sqlite',
          connection: {
            filename: configService.config.databaseUrl,
          },
          migrations: {
            migrationSource: new MyMigrationSource(),
          },
          useNullAsDefault: true,
        },
      }),
    }),
  ],
  providers: [MigrationService, ...repositories],
  exports: [KnexModule, ...repositories],
})
export class RepositoryModule {}
