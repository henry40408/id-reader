import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { KnexModule } from './knex/knex.module';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';

@Module({
  imports: [
    // dependencies
    SwaggerModule,
    TerminusModule,
    // own modules
    AppConfigModule,
    KnexModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        knex: {
          client: 'sqlite',
          connection: {
            filename: appConfigService.config.databaseUrl,
          },
          useNullAsDefault: true,
        },
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
