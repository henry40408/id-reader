import { Module } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { TerminusModule } from '@nestjs/terminus';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
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
    ViteModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
