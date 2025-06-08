import { Test } from '@nestjs/testing';
import nock from 'nock';
import { AppModule } from './app.module';
import { FeedEntity } from './entities/feed.entity';
import { ImageService } from './image.service';
import { PNG_1x1 } from './test.helper';

describe('Image service', () => {
  let service: ImageService;

  beforeEach(async () => {
    nock.disableNetConnect();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<ImageService>(ImageService);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
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
