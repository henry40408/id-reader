import fs from 'node:fs/promises';
import path from 'node:path';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { AppModule } from './app.module';
import { CategoryEntity, EntryEntity, FeedEntity, UserEntity } from './entities';
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
    nock('https://example.invalid').get('/feed.xml').reply(200, content);

    await em.persist(em.create(UserEntity, { id: 1, username: 'testuser', passwordHash: 'hashedpassword' })).flush();
    await em.persist(em.create(CategoryEntity, { id: 1, user: 1, name: 'Test Feed' })).flush();

    const feed = new FeedEntity();
    feed.title = 'Test Feed';
    feed.url = 'https://example.invalid/feed.xml';
    feed.link = 'https://example.invalid';
    feed.user = await em.findOneOrFail(UserEntity, 1);
    feed.category = await em.findOneOrFail(CategoryEntity, 1);

    await em.persist(feed).flush();

    await service.fetchEntries(feed);

    const entries = await em.find(EntryEntity, { feed: feed.id });
    expect(entries).toHaveLength(30);

    const entry = entries[0];
    expect(entry.guid).toBe('https://news.ycombinator.com/item?id=44350322');
    expect(entry.title).toBe('I wrote my PhD Thesis in Typst');
    expect(entry.content).toContain(`
<p>Article URL: <a href="https://fransskarman.com/phd_thesis_in_typst.html">https://fransskarman.com/phd_thesis_in_typst.html</a></p>
<p>Comments URL: <a href="https://news.ycombinator.com/item?id=44350322">https://news.ycombinator.com/item?id=44350322</a></p>
<p>Points: 487</p>
<p># Comments: 284</p>`);
    expect(entry.summary).toBe('');
    expect(entry.link).toBe('https://fransskarman.com/phd_thesis_in_typst.html');
    expect(entry.pubDate).toEqual(new Date('2025-06-22T21:12:01.000Z'));
    expect(entry.creator).toBe('todsacerdoti');
    expect(entry.categories).toEqual([]);
    expect(entry.feed.id).toBe(feed.id);
    expect(entry.user.id).toBe(1);
  });
});
