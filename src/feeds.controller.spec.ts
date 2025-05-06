import * as path from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { FeedsController } from './feeds.controller';
import { RepositoryModule } from './repository/repository.module';
import { OpmlModule } from './opml/opml.module';
import { createUser } from './test.helper';
import { RequestWithJwtPayload } from './gql/dtos.interface';

describe('FeedsController', () => {
  let moduleRef: TestingModule;
  let controller: FeedsController;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' }), OpmlModule, RepositoryModule],
      controllers: [FeedsController],
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
    expect(result).toEqual({ categoryCount: 1, feedCount: 2 });
  });
});
