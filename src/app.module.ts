import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { GraphQLFormattedError } from 'graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppController } from './app.controller';
import { AppConfigModule } from './app-config/app-config.module';
import { FeedsController } from './feeds.controller';
import { AppConfigService } from './app-config/app-config.service';
import { CategoryRepository } from './repository/category.repository';
import { FeedRepository } from './repository/feed.repository';
import { ImageRepository } from './repository/image.repository';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './auth.service';
import { AuthResolver } from './resolver/auth.resolver';
import { CategoryResolver } from './resolver/category.resolver';
import { FeedResolver } from './resolver/feed.resolver';
import { ImageResolver } from './resolver/image.resolver';
import { KnexService } from './knex.service';
import { OpmlService } from './opml.service';
import { FeedMetadataService } from './feed-metadata.service';
import { KnexHealthIndicator } from './knex.health';
import { IGqlContext } from './graphql.interface';
import { DataLoaderService } from './dataloader.service';

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
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.config.jwt.secret,
        signOptions: { expiresIn: configService.config.jwt.expiresInSeconds },
      }),
    }),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        autoSchemaFile: true,
        context: ({ req, res }: { req: Request; res: Response }): IGqlContext => ({
          req,
          res,
        }),
        formatError: (error) => {
          const err: GraphQLFormattedError = {
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: {
              code: error.extensions?.code,
              stacktrace: config.config.env.development ? error.extensions?.stacktrace : undefined,
            },
          };
          return err;
        },
        graphiql: true,
      }),
    }),
    SwaggerModule,
    TerminusModule,
    // own modules
    AppConfigModule,
  ],
  controllers: [AppController, FeedsController],
  providers: [
    // repositories
    CategoryRepository,
    FeedRepository,
    ImageRepository,
    // resolvers
    AuthResolver,
    CategoryResolver,
    FeedResolver,
    ImageResolver,
    UserRepository,
    // services
    AuthService,
    DataLoaderService,
    FeedMetadataService,
    KnexHealthIndicator,
    KnexService,
    OpmlService,
  ],
})
export class AppModule {}
