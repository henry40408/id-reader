import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from './app-config/app-config.module';
import { AppController } from './app.controller';
import { ViteService } from './vite/vite.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TerminusModule, AppConfigModule],
      controllers: [AppController],
      providers: [ViteService],
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
