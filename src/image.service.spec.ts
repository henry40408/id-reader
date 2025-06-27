import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { AppModule } from './app.module';
import { CategoryEntity, UserEntity } from './entities';
import { FeedEntity } from './entities/feed.entity';
import { ImageService } from './image.service';
import { PNG_1x1, PNG_1x1_SHA256SUM } from './test.helper';

describe('Image service', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;
  let service: ImageService;

  beforeEach(async () => {
    nock.disableNetConnect();
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    em = moduleRef.get(EntityManager);
    service = moduleRef.get(ImageService);
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

  it('should download feed image', async () => {
    const lastModified = new Date();
    nock('https://example.invalid').get('/feed.xml').reply(404, '').get('/favicon.ico').reply(200, PNG_1x1, {
      'Content-Type': 'image/png',
      ETag: '12345',
      'Last-Modified': lastModified.toUTCString(),
    });

    await em.persist(em.create(UserEntity, { id: 1, username: 'testuser', passwordHash: 'hashedpassword' })).flush();
    await em.persist(em.create(CategoryEntity, { id: 1, user: 1, name: 'Test Feed' })).flush();

    const feed = new FeedEntity();
    feed.title = 'Test Feed';
    feed.url = 'https://example.invalid/feed.xml';
    feed.link = 'https://example.invalid';
    feed.user = await em.findOneOrFail(UserEntity, 1);
    feed.category = await em.findOneOrFail(CategoryEntity, 1);

    await em.persist(feed).flush();

    {
      const image = await service.downloadFeedImage(feed);
      expect(image).toBeDefined();
      expect(image?.id).toBe(1);
      expect(image?.url).toBe('https://example.invalid/favicon.ico');
      expect(image?.contentType).toBe('image/png');
      expect(image?.blob).toEqual(PNG_1x1);
      expect(image?.etag).toBe('12345');
      expect(image?.lastModified).toEqual(lastModified.toUTCString());
      expect(image?.sha256sum).toBe(PNG_1x1_SHA256SUM);

      const updatedFeed = await em.findOneOrFail(FeedEntity, feed.id, { populate: ['image'] });
      expect(updatedFeed.image?.id).toBe(image?.id);
      expect(updatedFeed.image?.url).toBe(image?.url);
    }

    nock('https://example.invalid')
      .get('/feed.xml')
      .reply(404, '')
      .get('/favicon.ico')
      .matchHeader('If-None-Match', '12345')
      .matchHeader('If-Modified-Since', lastModified.toUTCString())
      .reply(304, '');
    {
      const image = await service.downloadFeedImage(feed);
      expect(image).toBeDefined();
      expect(image?.id).toBe(1);
    }
  });
});
