import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { SwaggerModule } from '@nestjs/swagger';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { GqlContext } from './interface';
import { KnexModule } from './knex/knex.module';
import { MyMigrationSource } from './migrations';
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
    ViteModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
