import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { KnexModule } from './knex/knex.module';
import { knexConfig } from './test.helper';

describe('AppController', () => {
  let moduleRef: TestingModule;
  let controller: AppController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [TerminusModule, KnexModule.register(knexConfig)],
      controllers: [AppController],
    }).compile();
    await moduleRef.init();
    controller = moduleRef.get<AppController>(AppController);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  describe('root', () => {
    it('should check health', async () => {
      await expect(controller.healthz()).resolves.toEqual({
        status: 'ok',
        info: {
          db: {
            status: 'up',
          },
        },
        error: {},
        details: {
          db: {
            status: 'up',
          },
        },
      });
    });
  });
});
