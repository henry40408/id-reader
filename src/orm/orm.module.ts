import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Logger, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule, AppConfigService } from '../app-config.module';
import { CategoryEntity, EntryEntity, FeedEntity, ImageEntity, JobLogEntity, UserEntity } from '../entities';
import { OrmHealthIndicator } from './orm.health';

const entities = [CategoryEntity, EntryEntity, FeedEntity, ImageEntity, JobLogEntity, UserEntity];

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      driver: SqliteDriver,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => {
        const logger = new Logger(OrmModule.name);
        return {
          driver: SqliteDriver,
          allowGlobalContext: configService.config.appEnv.test,
          dbName: configService.config.databaseUrl,
          debug: configService.config.appEnv.development,
          entities,
          highlighter: new SqlHighlighter(),
          logger: (message: string) => {
            logger.log(message);
          },
        };
      },
    }),
    MikroOrmModule.forFeature(entities),
    TerminusModule,
  ],
  providers: [OrmHealthIndicator],
  exports: [MikroOrmModule, OrmHealthIndicator],
})
export class OrmModule {}
