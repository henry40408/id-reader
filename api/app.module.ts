import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { ViteService } from './vite.service';
import { AppConfigModule } from './app-config.module';
import { AppConfigService } from './app-config.service';

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
  ],
  controllers: [AppController],
  providers: [ViteService],
})
export class AppModule {}
