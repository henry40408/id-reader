import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { ViteService } from './vite/vite.service';

@Module({
  imports: [TerminusModule, AppConfigModule],
  controllers: [AppController],
  providers: [ViteService],
})
export class AppModule {}
