import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ViteService } from './vite.service';
import { AppConfigModule } from './app-config.module';
import { AppConfigService } from './app-config.service';
import { UserEntity } from './user.entity';

const entities = [UserEntity];

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        pinoHttp: {
          level: configService.config.is.development ? 'debug' : 'info',
          formatters: {
            level: (label) => ({ label }),
          },
        },
      }),
    }),
    TerminusModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        type: 'better-sqlite3',
        database: configService.config.databaseUrl,
        entities,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  controllers: [AppController],
  providers: [ViteService],
})
export class AppModule {}
