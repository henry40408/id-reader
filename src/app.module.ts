import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppConfigModule } from './app-config/app-config.module';
import { RepositoryModule } from './repository/repository.module';
import { GqlModule } from './gql/gql.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // dependencies
    SwaggerModule,
    TerminusModule,
    // own modules
    AppConfigModule,
    AuthModule,
    GqlModule,
    RepositoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
