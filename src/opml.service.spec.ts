import fs from 'node:fs';
import path from 'node:path';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { CategoryEntity } from './entities/category.entity';
import { UserEntity } from './entities/user.entity';
import { DEFAULT_CATEGORY_NAME, OpmlService } from './opml.service';

describe('OPML service', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;
  let service: OpmlService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    service = moduleRef.get<OpmlService>(OpmlService);
    em = moduleRef.get(EntityManager);
    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();

    await em
      .fork()
      .persist(
        em.create(UserEntity, {
          id: 1,
          username: 'testuser',
          passwordHash: 'testpasswordhash',
        }),
      )
      .flush();

    jest.useFakeTimers();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should import feeds from OPML', async () => {
    const user = await em.findOneOrFail(UserEntity, { id: 1 });

    const readable = fs.createReadStream(path.join(__dirname, 'feeds.opml'));
    await service.importFeeds(user, readable);

    await expect(em.find(CategoryEntity, { user: user.id }, { populate: ['feeds'] })).resolves.toMatchObject([
      {
        name: 'Category 1',
        feeds: {
          '0': { title: 'Feed 1' },
          '1': { title: 'Feed 2' },
        },
      },
      { name: 'Category 2', feeds: { '0': { title: 'Feed 3' } } },
    ]);
  });

  it('should import feeds without category from OPML', async () => {
    const user = await em.findOneOrFail(UserEntity, { id: 1 });

    const readable = fs.createReadStream(path.join(__dirname, 'feeds-without-category.opml'));
    await service.importFeeds(user, readable);

    await expect(em.find(CategoryEntity, { user: user.id }, { populate: ['feeds'] })).resolves.toMatchObject([
      {
        name: DEFAULT_CATEGORY_NAME,
        feeds: {
          '0': { title: 'Feed 1' },
          '1': { title: 'Feed 3' },
          '2': { title: 'Feed 5' },
        },
      },
      {
        name: 'Category 1',
        feeds: { '0': { title: 'Feed 2' } },
      },
      {
        name: 'Category 2',
        feeds: { '0': { title: 'Feed 4' } },
      },
    ]);
  });

  it('should export feeds to OPML', async () => {
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

    const user = await em.findOneOrFail(UserEntity, { id: 1 });

    const category1 = em.create(CategoryEntity, { user, name: 'Category 1' });
    const category2 = em.create(CategoryEntity, { user, name: 'Category 2' });

    em.create('FeedEntity', {
      user,
      category: category1,
      title: 'Feed 1',
      url: 'http://example1.invalid/feed',
      link: 'http://example1.invalid',
    });
    em.create('FeedEntity', {
      user,
      category: category1,
      title: 'Feed 2',
      url: 'http://example2.invalid/feed',
      link: 'http://example2.invalid',
    });
    em.create('FeedEntity', {
      user,
      category: category2,
      title: 'Feed 3',
      url: 'http://example3.invalid/feed',
      link: 'http://example3.invalid',
    });

    await em.flush();

    const xml = await service.exportFeeds(user);
    expect(xml).toMatchSnapshot();
  });
});
