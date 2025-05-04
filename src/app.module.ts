import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';

@Module({
  imports: [SwaggerModule, TerminusModule],
  controllers: [AppController],
})
export class AppModule {}
