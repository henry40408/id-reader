import * as path from 'path';
import { createMock } from '@golevelup/ts-jest';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';
import { Feed } from 'knex/types/tables';
import { RequestWithJwtPayload } from './auth/auth.interface';
import { FeedsController } from './feeds.controller';
import { KNEX } from './knex/knex.constant';
import { KnexModule } from './knex/knex.module';
import { OpmlService } from './opml/opml.service';
import { CategoryRepository } from './repositories/category.repository';
import { FeedRepository } from './repositories/feed.repository';
import { UserRepository } from './repositories/user.repository';
import { knexConfig } from './test.helper';

describe('FeedsController', () => {
  let moduleRef: TestingModule;
  let controller: FeedsController;
  let userRepository: UserRepository;
  let knex: Knex;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig), JwtModule],
      providers: [OpmlService, UserRepository, CategoryRepository, FeedRepository],
      controllers: [FeedsController],
    }).compile();
    await moduleRef.init();
    controller = moduleRef.get<FeedsController>(FeedsController);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
    knex = moduleRef.get<Knex>(KNEX);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should import feeds', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const mockReq = createMock<RequestWithJwtPayload>({
      jwtPayload: {
        sub: user.id,
      },
    });

    const file = createMock<Express.Multer.File>({
      path: path.resolve(__dirname, '../fixtures/test.opml'),
    });

    {
      const rows = await knex<Feed>('feeds')
        .count('feeds.id', { as: 'count' })
        .join('categories', 'feeds.category_id', 'categories.id')
        .where('categories.user_id', user.id);
      expect(rows).toEqual([{ count: 0 }]);
    }

    const result = await controller.importFeeds(mockReq, file);
    expect(result).toEqual({ categoryCount: 1, feedCount: 2 });
  });
});
