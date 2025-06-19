import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, AppConfigService } from './app-config.module';
import { CategoryEntity } from './entities/category.entity';
import { FeedEntity } from './entities/feed.entity';
import { ImageEntity } from './entities/image.entity';
import { UserEntity } from './entities/user.entity';
import { SeedService } from './seed.service';

const entities = [CategoryEntity, FeedEntity, ImageEntity, UserEntity];

@Module({
  imports: [
    AppConfigModule,
    ConfigModule,
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
  providers: [SeedService],
})
export class SeedModule {}
