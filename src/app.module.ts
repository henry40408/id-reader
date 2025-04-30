import { Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { ViteService } from './vite/vite.service';

@Module({
  imports: [AppConfigModule, SwaggerModule, TerminusModule],
  controllers: [AppController],
  providers: [ViteService],
})
export class AppModule {}
