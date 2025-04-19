import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigService } from './app-config.service';
import { ViteService } from './vite.service';

@Module({
  imports: [ConfigModule.forRoot(), TerminusModule.forRoot()],
  controllers: [AppController],
  providers: [AppConfigService, AppService, ViteService],
})
export class AppModule {}
