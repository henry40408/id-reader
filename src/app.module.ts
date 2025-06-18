import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { GraphQLFormattedError } from 'graphql/error';
import { AppConfigModule, AppConfigService } from './app-config.module';
import { AppController } from './app.controller';
import { CategoryEntity } from './entities/category.entity';
import { FeedEntity } from './entities/feed.entity';
import { ImageEntity } from './entities/image.entity';
import { UserEntity } from './entities/user.entity';
import { GraphQLContext } from './graphql.context';
import { ImageService } from './image.service';
import { OpmlService } from './opml.service';
import { AuthResolver } from './resolvers/auth.resolver';

const entities = [CategoryEntity, FeedEntity, ImageEntity, UserEntity];

@Module({
  imports: [
    ConfigModule.forRoot(),
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        type: 'sqlite',
        database: configService.config.databaseUrl,
        entities,
        synchronize: !configService.config.appEnv.production,
      }),
    }),
    TypeOrmModule.forFeature(entities),
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
  ],
  controllers: [AppController],
  providers: [ImageService, OpmlService, AuthResolver],
})
export class AppModule {}
