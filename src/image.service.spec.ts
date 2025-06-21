import { MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { AppModule } from './app.module';
import { FeedEntity } from './entities/feed.entity';
import { ImageService } from './image.service';
import { PNG_1x1 } from './test.helper';

describe('Image service', () => {
  let moduleRef: TestingModule;
  let service: ImageService;

  beforeEach(async () => {
    nock.disableNetConnect();
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    service = moduleRef.get<ImageService>(ImageService);
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

  it('should download favicon', async () => {
    nock('https://example.invalid').get('/favicon.ico').reply(200, PNG_1x1, {
      'Content-Type': 'image/png',
    });
    const feed = {
      id: 1,
      link: 'https://example.invalid',
    } as FeedEntity;
    const image = await service.downloadFavicon(feed);
    expect(image).toBeDefined();
    expect(image?.url).toBe('https://example.invalid/favicon.ico');
    expect(image?.contentType).toBe('image/png');
    expect(image?.blob).toEqual(PNG_1x1);
  });
});
