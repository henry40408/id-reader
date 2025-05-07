import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLFormattedError } from 'graphql';
import { AuthModule } from '../auth/auth.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { DataLoaderModule } from '../dataloader/dataloader.module';
import { DataLoaderService } from '../dataloader/dataloader.service';
import { RepositoryModule } from '../repository/repository.module';
import { AuthResolver } from './resolver/auth.resolver';
import { IGqlContext } from './gql.interface';
import { CategoryResolver } from './resolver/category.resolver';
import { FeedResolver } from './resolver/feed.resolver';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
    DataLoaderModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AppConfigModule, DataLoaderModule],
      inject: [AppConfigService, DataLoaderService],
      useFactory: (config: AppConfigService, dataloader: DataLoaderService) => ({
        autoSchemaFile: true,
        context: ({ req, res }: { req: Request; res: Response }): IGqlContext => ({
          req,
          res,
          loaders: dataloader.loaders,
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
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.config.jwt.secret,
        signOptions: {
          expiresIn: config.config.jwt.expiresInSeconds,
        },
      }),
    }),
    RepositoryModule,
  ],
  providers: [AuthResolver, CategoryResolver, FeedResolver],
  exports: [AuthResolver, CategoryResolver, FeedResolver, JwtModule],
})
export class GqlModule {}
