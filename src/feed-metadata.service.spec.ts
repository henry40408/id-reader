import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { FeedMetadataService } from './feed-metadata.service';
import { KnexService } from './knex.service';
import { createCategory, createFeed, createUser, IMAGE_1x1 } from './test.helper';
import { AppConfigModule } from './app-config/app-config.module';
import { ImageRepository } from './repository/image.repository';
import { UserRepository } from './repository/user.repository';
import { CategoryRepository } from './repository/category.repository';
import { FeedRepository } from './repository/feed.repository';

describe('FeedMetadataService', () => {
  let service: FeedMetadataService;
  let moduleRef: TestingModule;
  let knexService: KnexService;

  beforeEach(async () => {
    nock.cleanAll();
    nock.disableNetConnect();
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        CategoryRepository,
        FeedMetadataService,
        FeedRepository,
        ImageRepository,
        KnexService,
        UserRepository,
      ],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<FeedMetadataService>(FeedMetadataService);
    knexService = moduleRef.get<KnexService>(KnexService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
    nock.enableNetConnect();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should attach existing image to feed', async () => {
    const scope = nock('http://example.invalid')
      .get('/feed')
      .reply(
        200,
        `<rss version="2.0"><channel><image><url>http://example.invalid/image.png</url></image></channel></rss>`,
      )
      .head('/image.png')
      .reply(200, '', {
        'content-type': 'image/png',
        etag: 'test',
        'last-modified': 'Sat, 01 Jan 2000 00:00:00 GMT',
      });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, {
      htmlUrl: 'http://example.invalid',
      xmlUrl: 'http://example.invalid/feed',
    });

    const [imageId] = await knexService.connection('images').insert({
      url: 'http://example.invalid/image.png',
      blob: IMAGE_1x1,
      content_type: 'image/png',
      etag: 'test',
      last_modified: 'Sat, 01 Jan 2000 00:00:00 GMT',
    });

    const image = await service.updateFeedImage(feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBe(imageId);

    const updated = await knexService.connection('feeds').where('id', feed.id).first();
    expect(updated?.image_id).toBe(imageId);

    scope.done();
  });

  it('should download image from feed and attach it to feed', async () => {
    const scope = nock('http://example.invalid')
      .get('/feed')
      .reply(
        200,
        `<rss version="2.0"><channel><image><url>http://example.invalid/image.png</url></image></channel></rss>`,
      )
      .get('/image.png')
      .reply(200, IMAGE_1x1, {
        'content-type': 'image/png',
      });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, { xmlUrl: 'http://example.invalid/feed' });

    const image = await service.updateFeedImage(feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBeDefined();

    const updated = await knexService.connection('feeds').where('id', feed.id).first();
    expect(updated?.image_id).toBeDefined();

    scope.done();
  });

  it('should download image from feed and attach it to feed if its path is relative', async () => {
    const scope = nock('http://example.invalid')
      .get('/feed')
      .reply(200, `<rss version="2.0"><channel><image><url>/image.png</url></image></channel></rss>`)
      .get('/image.png')
      .reply(200, IMAGE_1x1, {
        'content-type': 'image/png',
      });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, { xmlUrl: 'http://example.invalid/feed' });

    const image = await service.updateFeedImage(feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBeDefined();

    const updated = await knexService.connection('feeds').where('id', feed.id).first();
    expect(updated?.image_id).toBeDefined();

    scope.done();
  });

  it('should download image from alternate', async () => {
    const scope = nock('http://example.invalid')
      .get('/feed')
      .reply(200, `<rss version="2.0"><channel></channel></rss>`)
      .get('/')
      .reply(200, `<link rel="canonical" href="/canonical" />`)
      .get('/canonical')
      .reply(200, `<link rel="alternate" type="application/rss+xml" href="/alternate" />`)
      .get('/alternate')
      .reply(200, `<rss version="2.0"><channel><image><url>/image.png</url></image></channel></rss>`)
      .get('/image.png')
      .reply(200, IMAGE_1x1, { 'content-type': 'image/png' });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, {
      htmlUrl: 'http://example.invalid',
      xmlUrl: 'http://example.invalid/feed',
    });

    const image = await service.updateFeedImage(feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBeDefined();

    const updated = await knexService.connection('feeds').where('id', feed.id).first();
    expect(updated?.image_id).toBeDefined();

    scope.done();
  });

  it('should attach favicon to feed', async () => {
    const scope = nock('http://example.invalid')
      .get('/feed')
      .reply(200, `<rss version="2.0"><channel></channel></rss>`)
      .get('/')
      .reply(200, `<link rel="icon" href="/favicon.ico" />`)
      .get('/favicon.ico')
      .reply(200, IMAGE_1x1, { 'content-type': 'image/png' });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, {
      htmlUrl: 'http://example.invalid',
      xmlUrl: 'http://example.invalid/feed',
    });

    const image = await service.updateFeedImage(feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBeDefined();

    const updated = await knexService.connection('feeds').where('id', feed.id).first();
    expect(updated?.image_id).toBeDefined();

    scope.done();
  });

  it('should attach apple touch icon to feed', async () => {
    const scope = nock('http://example.invalid')
      .get('/feed')
      .reply(200, `<rss version="2.0"><channel></channel></rss>`)
      .get('/')
      .reply(200, `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`)
      .get('/apple-touch-icon.png')
      .reply(200, IMAGE_1x1, { 'content-type': 'image/png' });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, {
      htmlUrl: 'http://example.invalid',
      xmlUrl: 'http://example.invalid/feed',
    });

    const image = await service.updateFeedImage(feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBeDefined();

    const updated = await knexService.connection('feeds').where('id', feed.id).first();
    expect(updated?.image_id).toBeDefined();

    scope.done();
  });
});
