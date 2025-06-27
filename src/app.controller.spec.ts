import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from './app-config.module';
import { AppController } from './app.controller';
import { OrmModule } from './orm/orm.module';

describe('AppController', () => {
  let moduleRef: TestingModule;
  let controller: AppController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, TerminusModule, OrmModule],
      controllers: [AppController],
    }).compile();
    controller = moduleRef.get(AppController);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('root', () => {
    it('should return health check response', async () => {
      await expect(controller.check()).resolves.toEqual(
        expect.objectContaining({
          status: 'ok',
          info: {
            db: { status: 'up' },
          },
        }),
      );
    });
  });
});
