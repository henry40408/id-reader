import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, AppConfigService } from './app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryEntity } from './entities/category.entity';
import { FeedEntity } from './entities/feed.entity';
import { UserEntity } from './entities/user.entity';
import { OpmlService } from './opml.service';

const entities = [CategoryEntity, FeedEntity, UserEntity];

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        type: 'sqlite',
        database: configService.config.databaseUrl,
        entities,
        synchronize: !configService.config.appEnv.production,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [AppController],
  providers: [AppService, OpmlService],
})
export class AppModule {}
