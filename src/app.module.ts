import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule, AppConfigService } from './app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryEntity } from './entities/category.entity';
import { UserEntity } from './entities/user.entity';

const entities = [CategoryEntity, UserEntity];

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
  providers: [AppService],
})
export class AppModule {}
