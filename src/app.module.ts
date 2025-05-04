import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { KnexModule } from './knex/knex.module';

@Module({
  imports: [
    // dependencies
    SwaggerModule,
    TerminusModule,
    // own modules
    KnexModule.register({
      knex: {
        client: 'sqlite',
        connection: {
          filename: ':memory:',
        },
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
