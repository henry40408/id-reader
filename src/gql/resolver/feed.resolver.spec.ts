import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { RepositoryModule } from '../../repository/repository.module';
import { createUser } from '../../test.helper';
import { IGqlContext } from '../gql.interface';
import { RequestWithJwtPayload } from '../dtos.interface';
import { FeedMetadataModule } from '../../feed-metadata/feed-metadata.module';
import { FeedResolver } from './feed.resolver';

describe('FeedResolver', () => {
  let moduleRef: TestingModule;
  let resolver: FeedResolver;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [FeedMetadataModule, JwtModule.register({ secret: 'secret' }), RepositoryModule],
      providers: [FeedResolver],
    }).compile();
    await moduleRef.init();
    resolver = moduleRef.get<FeedResolver>(FeedResolver);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
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
});
