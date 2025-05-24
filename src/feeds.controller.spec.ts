import * as path from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { Response } from 'express';
import { FeedsController } from './feeds.controller';
import { createUser } from './test.helper';
import { RequestWithJwtPayload } from './object.interface';
import { KnexService } from './knex.service';
import { AppConfigModule } from './app-config/app-config.module';
import { OpmlService } from './opml.service';
import { UserRepository } from './repository/user.repository';

describe('FeedsController', () => {
  let moduleRef: TestingModule;
  let controller: FeedsController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, JwtModule.register({ secret: 'secret' })],
      controllers: [FeedsController],
      providers: [KnexService, OpmlService, UserRepository],
    }).compile();
    await moduleRef.init();
    controller = moduleRef.get<FeedsController>(FeedsController);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should import feeds', async () => {
    const user = await createUser(moduleRef);
    const req = createMock<RequestWithJwtPayload>({
      jwtPayload: { sub: user.id, username: user.username },
    });
    const file = createMock<Express.Multer.File>({
      path: path.resolve(__dirname, '../fixtures/test.opml'),
    });
    const result = await controller.importFeeds(req, file);
    expect(result).toEqual({ categoryCount: 2, feedCount: 4 });
  });

  it('should export feeds', async () => {
    const user = await createUser(moduleRef);
    const req = createMock<RequestWithJwtPayload>({
      jwtPayload: { sub: user.id, username: user.username },
    });
    const res = createMock<Response>();
    await controller.exportFeeds(req, res);
    expect(res.send).toHaveBeenCalledWith(expect.any(String));
  });
});
