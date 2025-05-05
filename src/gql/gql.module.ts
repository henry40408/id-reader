import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { JwtModule } from '@nestjs/jwt';
import { GraphQLFormattedError } from 'graphql';
import { AuthModule } from '../auth/auth.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { AppConfigService } from '../app-config/app-config.service';
import { AuthResolver } from './auth.resolver';
import { GqlContext } from './gql.interface';

@Module({
  imports: [
    AppConfigModule,
    AuthModule,
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
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        autoSchemaFile: true,
        context: ({ req, res }: { req: Request; res: Response }): GqlContext => ({ req, res }),
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
  ],
  providers: [AuthResolver],
  exports: [AuthResolver],
})
export class GqlModule {}
