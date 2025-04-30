import { Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { KnexModule } from './knex/knex.module';
import { ViteService } from './vite/vite.service';

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
        },
      }),
    }),
    SwaggerModule,
    TerminusModule,
  ],
  controllers: [AppController],
  providers: [ViteService],
})
export class AppModule {}
