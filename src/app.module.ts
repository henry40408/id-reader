import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';

@Module({
  imports: [TerminusModule],
  controllers: [AppController],
})
export class AppModule {}
