import { TerminusModule } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        TerminusModule,
        TypeOrmModule.forRoot({
          database: ':memory:',
          type: 'sqlite',
        }),
      ],
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check response', async () => {
      await expect(appController.check()).resolves.toEqual(
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
