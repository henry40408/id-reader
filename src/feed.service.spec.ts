import fs from 'node:fs/promises';
import path from 'node:path';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { AppModule } from './app.module';
import { CategoryEntity, EntryEntity, FeedEntity, JobLogEntity, UserEntity } from './entities';
import { FeedService } from './feed.service';

describe('FeedService', () => {
  let moduleRef: TestingModule;
  let service: FeedService;
  let em: EntityManager;

  beforeEach(async () => {
    nock.disableNetConnect();
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    em = moduleRef.get(EntityManager);
    service = moduleRef.get(FeedService);
    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();
  });

  afterEach(async () => {
    nock.cleanAll();
    nock.enableNetConnect();
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch entries from a RSS feed', async () => {
    const content = await fs.readFile(path.join(__dirname, 'hnrss.xml'), 'utf-8');
    nock('https://example.invalid').get('/feed.xml').times(2).reply(200, content);

    await em.persist(em.create(UserEntity, { id: 1, username: 'testuser', passwordHash: 'hashedpassword' })).flush();
    await em.persist(em.create(CategoryEntity, { id: 1, user: 1, name: 'Test Feed' })).flush();

    const feed = new FeedEntity();
    feed.title = 'Test Feed';
    feed.url = 'https://example.invalid/feed.xml';
    feed.link = 'https://example.invalid';
    feed.user = await em.findOneOrFail(UserEntity, 1);
    feed.category = await em.findOneOrFail(CategoryEntity, 1);

    await em.persist(feed).flush();

    await service.fetchFeedEntries(feed);

    const entries = await em.find(EntryEntity, { feed: feed.id });
    expect(entries).toHaveLength(30);

    const entry = entries[0];
    expect(entry.guid).toBe('https://news.ycombinator.com/item?id=44350322');
    expect(entry.title).toBe('I wrote my PhD Thesis in Typst');
    expect(entry.isoDate).toEqual(new Date('2025-06-22T21:12:01.000Z'));
    expect(entry.link).toBe('https://fransskarman.com/phd_thesis_in_typst.html');
    expect(entry.creator).toBe('todsacerdoti');
    expect(entry.categories).toEqual([]);
    expect(entry.feed.id).toBe(feed.id);
    expect(entry.user.id).toBe(1);

    // Re-fetch entries on the same feed doesn't throw any errors
    await service.fetchFeedEntries(feed);
  });

  it('should fetch entries from multiple feeds', async () => {
    const content = await fs.readFile(path.join(__dirname, 'hnrss.xml'), 'utf-8');
    nock('https://example.invalid').get('/feed1.xml').reply(200, content).get('/feed2.xml').reply(200, content);

    await em.persist(em.create(UserEntity, { id: 1, username: 'testuser', passwordHash: 'hashedpassword' })).flush();
    await em.persist(em.create(CategoryEntity, { id: 1, user: 1, name: 'Test Feed' })).flush();

    const feed1 = new FeedEntity();
    feed1.title = 'Test Feed 1';
    feed1.url = 'https://example.invalid/feed1.xml';
    feed1.link = 'https://example.invalid';
    feed1.user = await em.findOneOrFail(UserEntity, 1);
    feed1.category = await em.findOneOrFail(CategoryEntity, 1);

    const feed2 = new FeedEntity();
    feed2.title = 'Test Feed 2';
    feed2.url = 'https://example.invalid/feed2.xml';
    feed2.link = 'https://example.invalid';
    feed2.user = await em.findOneOrFail(UserEntity, 1);
    feed2.category = await em.findOneOrFail(CategoryEntity, 1);

    await em.persist([feed1, feed2]).flush();

    await service.fetchEntries(1, 86_400);

    const entriesFeed1 = await em.find(EntryEntity, { feed: feed1.id });
    expect(entriesFeed1).toHaveLength(30);

    const entriesFeed2 = await em.find(EntryEntity, { feed: feed2.id });
    expect(entriesFeed2).toHaveLength(30);

    const jobLog = await em.findOne(JobLogEntity, { externalId: String(feed1.id) });
    expect(jobLog?.name).toBe('feed:fetch_entries');
    expect(jobLog?.status).toBe('ok');
    expect(jobLog?.payload).toEqual({ type: 'ok', result: {} });
  });
});
