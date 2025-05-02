import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { KnexModule } from './knex/knex.module';
import { knexConfig } from './test.helper';
import { ViteModule } from './vite/vite.module';

describe('AppController', () => {
  let moduleRef: TestingModule;
  let controller: AppController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, KnexModule.register(knexConfig), TerminusModule, ViteModule],
      controllers: [AppController],
      providers: [],
    }).compile();
    controller = moduleRef.get<AppController>(AppController);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
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
