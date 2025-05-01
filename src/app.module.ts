import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { FeedsController } from './feeds.controller';
import { GqlContext } from './interface';
import { KnexModule } from './knex/knex.module';
import { MyMigrationSource } from './migrations';
import { OpmlModule } from './opml/opml.module';
import { ViteModule } from './vite/vite.module';

@Module({
  imports: [
    KnexModule.registerAsync({
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        knex: {
          client: 'better-sqlite3',
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
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: true,
      context: ({ req, res }: GqlContext): GqlContext => ({ req, res }),
      driver: ApolloDriver,
      formatError: (error) => ({
        ...error,
        extensions: {
          code: error.extensions?.code,
        },
      }),
      graphiql: true,
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
})
export class AppModule {}
