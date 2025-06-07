import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserEntity } from './entities/user.entity';
import { AppConfigModule, AppConfigService } from './app-config.module';

const entities = [UserEntity];

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
