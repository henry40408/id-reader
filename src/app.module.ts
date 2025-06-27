import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { TerminusModule } from '@nestjs/terminus';
import { Request, Response } from 'express';
import { GraphQLFormattedError } from 'graphql/error';
import { AppConfigModule, AppConfigService } from './app-config.module';
import { AppController } from './app.controller';
import { FeedService } from './feed.service';
import { FeedsController } from './feeds.controller';
import { GraphQLContext } from './graphql.context';
import { ImageService } from './image.service';
import { ImagesController } from './images.controller';
import { OpmlService } from './opml.service';
import { OrmModule } from './orm/orm.module';
import { AuthResolver, CategoriesResolver } from './resolvers';
import { FeedsResolver } from './resolvers/feeds.resolver';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppConfigModule,
    OrmModule,
    TerminusModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }: { req: Request; res: Response }): GraphQLContext => ({ req, res }),
      formatError: (error) => {
        const formatted: GraphQLFormattedError = {
          ...error,
          extensions: {
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            originalError: error.extensions?.originalError,
          },
        };
        return formatted;
      },
      graphiql: true,
    }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.config.jwt.secret,
        signOptions: { expiresIn: configService.config.jwt.expiresIn },
      }),
    }),
    MulterModule.register({
      dest: '/tmp',
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  ],
  controllers: [AppController, FeedsController, ImagesController],
  providers: [
    // services
    FeedService,
    ImageService,
    OpmlService,
    // GraphQL resolvers
    AuthResolver,
    CategoriesResolver,
    FeedsResolver,
  ],
})
export class AppModule {}
