import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OrmModule } from '../orm/orm.module';
import { CategoryEntity } from './category.entity';
import { FeedEntity, UserEntity } from '.';

describe('Feed entity', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrmModule],
    }).compile();
    em = moduleRef.get(EntityManager);
    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should unique by userId, categoryId, and url', async () => {
    await em
      .fork()
      .persist(
        em.create(UserEntity, {
          id: 1,
          username: 'testuser',
          passwordHash: 'hashedpassword',
        }),
      )
      .flush();

    await em
      .fork()
      .persist(
        em.create(CategoryEntity, {
          id: 1,
          user: 1,
          name: 'Test Category',
        }),
      )
      .flush();

    const feed1 = em.create(FeedEntity, {
      user: 1,
      category: 1,
      title: 'Test Feed 1',
      url: 'http://example.com/feed1',
    });
    await em.fork().persist(feed1).flush();

    const feed2 = em.create(FeedEntity, {
      user: 1,
      category: 1,
      title: 'Test Feed 2',
      url: 'http://example.com/feed2',
    });
    await em.fork().persist(feed2).flush();

    const duplicateFeed = em.create(FeedEntity, {
      user: 1,
      category: 1,
      title: 'Duplicate Feed',
      url: 'http://example.com/feed1', // Same URL as feed1
    });

    await expect(em.fork().persist(duplicateFeed).flush()).rejects.toThrow(
      'SQLITE_CONSTRAINT: UNIQUE constraint failed',
    );
  });
});
