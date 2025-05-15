import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import nock from 'nock';
import { RepositoryModule } from '../../repository/repository.module';
import { createCategory, createFeed, createUser, IMAGE_1x1 } from '../../test.helper';
import { IGqlContext } from '../gql.interface';
import { RequestWithJwtPayload } from '../dtos.interface';
import { FeedMetadataModule } from '../../feed-metadata/feed-metadata.module';
import { FeedResolver } from './feed.resolver';

describe('FeedResolver', () => {
  let moduleRef: TestingModule;
  let resolver: FeedResolver;

  beforeEach(async () => {
    nock.disableNetConnect();
    moduleRef = await Test.createTestingModule({
      imports: [FeedMetadataModule, JwtModule.register({ secret: 'secret' }), RepositoryModule],
      providers: [FeedResolver],
    }).compile();
    await moduleRef.init();
    resolver = moduleRef.get<FeedResolver>(FeedResolver);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
    nock.enableNetConnect();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should get feeds', async () => {
    const user = await createUser(moduleRef);
    const context = createMock<IGqlContext<RequestWithJwtPayload>>({
      req: createMock<RequestWithJwtPayload>({
        jwtPayload: { sub: user.id, username: user.username },
      }),
    });
    const feeds = await resolver.feeds(context);
    expect(feeds).toEqual([]);
  });

  it('should get feed by id', async () => {
    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, {
      htmlUrl: 'http://example.invalid/feed',
      xmlUrl: 'http://example.invalid/feed',
    });
    const context = createMock<IGqlContext<RequestWithJwtPayload>>({
      req: createMock<RequestWithJwtPayload>({
        jwtPayload: { sub: user.id, username: user.username },
      }),
    });
    const found = await resolver.feed(context, feed.id);
    expect(found.id).toBe(feed.id);
  });

  it('should update feed image', async () => {
    nock('http://example.invalid')
      .get('/feed')
      .reply(
        200,
        `<rss version="2.0"><channel><image><url>http://example.invalid/image.png</url></image></channel></rss>`,
        { 'content-type': 'application/rss+xml' },
      )
      .get('/image.png')
      .reply(200, IMAGE_1x1, {
        'content-type': 'image/png',
      });

    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const feed = await createFeed(moduleRef, category, {
      htmlUrl: 'http://example.invalid',
      xmlUrl: 'http://example.invalid/feed',
    });
    const context = createMock<IGqlContext<RequestWithJwtPayload>>({
      req: createMock<RequestWithJwtPayload>({
        jwtPayload: { sub: user.id, username: user.username },
      }),
    });
    const image = await resolver.updateFeedImage(context, feed.id);
    expect(image).toBeDefined();
    expect(image?.id).toBeDefined();
    expect(image?.url).toBeDefined();
  });
});
