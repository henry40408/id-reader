import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppConfigModule } from './app-config/app-config.module';
import { RepositoryModule } from './repository/repository.module';

@Module({
  imports: [
    // dependencies
    SwaggerModule,
    TerminusModule,
    // own modules
    AppConfigModule,
    RepositoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
