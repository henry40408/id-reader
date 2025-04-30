import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AppController } from './app.controller';
import { KnexModule } from './knex/knex.module';
import { ViteService } from './vite/vite.service';

describe('AppController', () => {
  let moduleRef: TestingModule;
  let controller: AppController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        AppConfigModule,
        KnexModule.registerAsync({
          imports: [AppConfigModule],
          inject: [AppConfigService],
          useFactory: (configService: AppConfigService) => ({
            knex: {
              client: 'better-sqlite3',
              connection: { filename: configService.config.databaseUrl },
              useNullAsDefault: true,
            },
          }),
        }),
        TerminusModule,
      ],
      controllers: [AppController],
      providers: [ViteService],
    }).compile();
    controller = moduleRef.get<AppController>(AppController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('healthz', () => {
    it('should check health', async () => {
      const result = await controller.healthz();
      expect(result).toEqual({
        status: 'ok',
        details: { db: { status: 'up' } },
        error: {},
        info: { db: { status: 'up' } },
      });
    });
  });
});
