import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { TerminusModule } from '@nestjs/terminus';
import { Request, Response } from 'express';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CategoriesResolver } from './categories.resolver';
import { DataloaderModule } from './dataloaders/dataloader.module';
import { DataloaderService } from './dataloaders/dataloader.service';
import { FeedsController } from './feeds.controller';
import { FeedsResolver } from './feeds.resolver';
import { IGqlContext } from './interface';
import { KnexModule } from './knex/knex.module';
import { MyMigrationSource } from './migrations';
import { OpmlModule } from './opml/opml.module';
import { CategoryRepository } from './repositories/category.repository';
import { FeedRepository } from './repositories/feed.repository';
import { ViteModule } from './vite/vite.module';

@Module({
  imports: [
    KnexModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        knex: {
          client: 'sqlite3',
          connection: {
            filename: configService.config.databaseUrl,
          },
          useNullAsDefault: true,
          migrations: {
            migrationSource: new MyMigrationSource(),
          },
        },
      }),
    }),
    SwaggerModule,
    TerminusModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [DataloaderModule],
      inject: [DataloaderService],
      driver: ApolloDriver,
      useFactory: (dataloaderService: DataloaderService) => ({
        autoSchemaFile: true,
        context: ({ req, res }: { req: Request; res: Response }): IGqlContext => ({
          req,
          res,
          loaders: dataloaderService.loaders,
        }),
        formatError: (error) => ({
          ...error,
          extensions: {
            code: error.extensions?.code,
          },
        }),
        graphiql: true,
      }),
    }),
    JwtModule.registerAsync({
      global: true, // initialize in module results in multiple instances
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        secret: configService.config.jwt.secret,
        signOptions: { expiresIn: configService.config.jwt.expiresInSeconds },
      }),
    }),
    MulterModule.register({
      dest: '.temp/uploads',
    }),
    ViteModule,
    AuthModule,
    OpmlModule,
  ],
  controllers: [FeedsController, AppController],
  providers: [CategoriesResolver, CategoryRepository, FeedRepository, FeedsResolver],
})
export class AppModule {}
