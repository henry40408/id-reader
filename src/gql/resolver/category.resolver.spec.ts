import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { RepositoryModule } from '../../repository/repository.module';
import { IGqlContext } from '../gql.interface';
import { RequestWithJwtPayload } from '../dtos.interface';
import { CategoryResolver } from './category.resolver';
import { createUser } from 'src/test.helper';

describe('CategoryResolver', () => {
  let moduleRef: TestingModule;
  let resolver: CategoryResolver;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' }), RepositoryModule],
      providers: [CategoryResolver],
    }).compile();
    await moduleRef.init();
    resolver = moduleRef.get<CategoryResolver>(CategoryResolver);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should get categories', async () => {
    const user = await createUser(moduleRef);
    const context = createMock<IGqlContext<RequestWithJwtPayload>>({
      req: createMock<RequestWithJwtPayload>({
        jwtPayload: { sub: user.id, username: user.username },
      }),
    });
    const categories = await resolver.categories(context);
    expect(categories).toEqual([]);
  });
});
