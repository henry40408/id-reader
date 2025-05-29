import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { TestingModule, Test } from '@nestjs/testing';
import { Category, Feed } from 'knex/types/tables';
import { createUser } from './test.helper';
import { DEFAULT_CATEGORY_NAME } from './opml.constant';
import { OpmlService } from './opml.service';
import { KnexService } from './knex.service';
import { AppConfigModule } from './app-config/app-config.module';
import { UserRepository } from './repository/user.repository';

describe('OpmlService', () => {
  let moduleRef: TestingModule;
  let service: OpmlService;
  let knexService: KnexService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [KnexService, OpmlService, UserRepository],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<OpmlService>(OpmlService);
    knexService = moduleRef.get<KnexService>(KnexService);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2000-01-01T00:00:00.000Z'));
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should import feeds', async () => {
    const user = await createUser(moduleRef);

    const categories = await service.parseOPML(fs.createReadStream(path.resolve(__dirname, '../fixtures/test.opml')));
    const counts = await service.importFeeds(user.id, categories);
    expect(counts).toEqual({ categoryCount: 2, feedCount: 4 });

    const category = await knexService.connection<Category>('categories').where('user_id', user.id).first();
    expect(category).toBeDefined();
    expect(category?.name).toEqual('Test Category 1');

    const feeds = await knexService
      .connection<Feed>('feeds')
      .where('category_id', category?.id)
      .orderBy('title', 'asc');
    expect(feeds).toHaveLength(2);
    expect(feeds.map((f) => f.title)).toEqual(['Test Feed 1', 'Test Feed 2']);
  });

  it('should parse OPML file', async () => {
    const readable = fs.createReadStream(path.resolve(__dirname, '../fixtures/test.opml'));
    const opml = await service.parseOPML(readable);
    expect(opml).toEqual([
      {
        name: 'Test Category 1',
        feeds: [
          {
            title: 'Test Feed 1',
            htmlUrl: 'http://test.invalid',
            xmlUrl: 'http://test.invalid/feed/1',
          },
          {
            title: 'Test Feed 2',
            htmlUrl: 'http://blog.test.invalid',
            xmlUrl: 'http://blog.test.invalid/feed/2',
          },
        ],
      },
      {
        name: 'Test Category 2',
        feeds: [
          {
            title: 'Test Feed 3',
            xmlUrl: 'http://test.invalid/feed/3',
            htmlUrl: 'http://test.invalid',
          },
          {
            title: 'Test Feed 4',
            xmlUrl: 'http://blog.test.invalid/feed/4',
            htmlUrl: 'http://blog.test.invalid',
          },
        ],
      },
    ]);
  });

  it('should throw an error if the OPML file is invalid', async () => {
    const readable = new Readable();
    readable.push('invalid');
    readable.push(null);
    await expect(service.parseOPML(readable)).rejects.toThrow('Non-whitespace before first tag.');
  });

  it('should parse OPML file with no category', async () => {
    const readable = fs.createReadStream(path.resolve(__dirname, '../fixtures/no-category.opml'));
    const opml = await service.parseOPML(readable);
    expect(opml).toEqual([
      {
        name: DEFAULT_CATEGORY_NAME,
        feeds: [
          {
            title: 'Test Feed 1',
            htmlUrl: 'http://test.invalid',
            xmlUrl: 'http://test.invalid/feed',
          },
          {
            title: 'Test Feed 2',
            htmlUrl: 'http://blog.test.invalid',
            xmlUrl: 'http://blog.test.invalid/feed',
          },
        ],
      },
    ]);
  });

  it('should export OPML file', async () => {
    const user = await createUser(moduleRef);

    const categories = await service.parseOPML(fs.createReadStream(path.resolve(__dirname, '../fixtures/test.opml')));
    const counts = await service.importFeeds(user.id, categories);
    expect(counts).toEqual({ categoryCount: 2, feedCount: 4 });

    const opml = await service.exportOPML(user.id);
    expect(opml).toContain('<dateCreated>Sat, 01 Jan 2000 00:00:00 GMT</dateCreated>');

    const parsed = await service.parseOPML(Readable.from(opml));

    const categoryTitles = categories.map((c) => c.name).sort();
    const expectedCategoryTitles = parsed.map((c) => c.name).sort();
    expect(expectedCategoryTitles).toEqual(categoryTitles);

    const feedTitles = categories
      .flatMap((c) => c.feeds)
      .map((f) => f.title)
      .sort();
    const expectedFeedTitles = parsed
      .flatMap((c) => c.feeds)
      .map((f) => f.title)
      .sort();
    expect(expectedFeedTitles).toEqual(feedTitles);
  });
});
