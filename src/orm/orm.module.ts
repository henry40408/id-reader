import { MikroOrmModule } from '@mikro-orm/nestjs';
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { SqliteDriver } from '@mikro-orm/sqlite';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule, AppConfigService } from '../app-config.module';
import { CategoryEntity, FeedEntity, ImageEntity, UserEntity } from '../entities';
import { OrmHealthIndicator } from './orm.health';

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      driver: SqliteDriver,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        driver: SqliteDriver,
        entities: [CategoryEntity, FeedEntity, ImageEntity, UserEntity],
        dbName: configService.config.databaseUrl,
        highlighter: new SqlHighlighter(),
        debug: configService.config.appEnv.development,
        allowGlobalContext: configService.config.appEnv.test,
      }),
    }),
    MikroOrmModule.forFeature([CategoryEntity, FeedEntity, ImageEntity, UserEntity]),
    TerminusModule,
  ],
  providers: [OrmHealthIndicator],
  exports: [MikroOrmModule, OrmHealthIndicator],
})
export class OrmModule {}
