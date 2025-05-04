import { Test, TestingModule } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should check health', async () => {
      await expect(appController.healthz()).resolves.toEqual({
        status: 'ok',
        info: {},
        error: {},
        details: {},
      });
    });
  });
});
