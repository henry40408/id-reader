import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule],
      controllers: [AppController],
    }).compile();
    controller = moduleRef.get<AppController>(AppController);
  });

  describe('healthz', () => {
    it('should check health', async () => {
      const result = await controller.healthz();
      expect(result).toEqual({
        status: 'ok',
        details: {},
        error: {},
        info: {},
      });
    });
  });
});
