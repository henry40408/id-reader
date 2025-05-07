import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { AppConfigModule } from './app-config/app-config.module';
import { RepositoryModule } from './repository/repository.module';
import { GqlModule } from './gql/gql.module';
import { AuthModule } from './auth/auth.module';
import { FeedsController } from './feeds.controller';
import { OpmlModule } from './opml/opml.module';
import { AppConfigService } from './app-config/app-config.service';

@Module({
  imports: [
    // dependencies
    MulterModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        dest: configService.config.uploads,
      }),
    }),
    SwaggerModule,
    TerminusModule,
    // own modules
    AppConfigModule,
    AuthModule,
    GqlModule,
    OpmlModule,
    RepositoryModule,
  ],
  controllers: [AppController, FeedsController],
})
export class AppModule {}
