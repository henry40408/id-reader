import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { HealthCheckService } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViteService } from './vite.service';

const mockHealthCheckService = createMock<HealthCheckService>();

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        { provide: ViteService, useValue: {} },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('checks health', async () => {
      mockHealthCheckService.check.mockResolvedValue({
        status: 'ok',
        details: {},
        error: {},
        info: {},
      });
      await expect(appController.healthz()).resolves.toEqual({
        status: 'ok',
        details: {},
        error: {},
        info: {},
      });
    });
  });
});
