import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { IGqlContext } from '../graphql.interface';
import { RequestWithJwtPayload } from '../object.interface';
import { createUser } from '../test.helper';
import { AppConfigModule } from '../app-config/app-config.module';
import { KnexService } from '../knex.service';
import { UserRepository } from '../repository/user.repository';
import { DataLoaderService } from '../dataloader.service';
import { CategoryResolver } from './category.resolver';

describe('CategoryResolver', () => {
  let moduleRef: TestingModule;
  let resolver: CategoryResolver;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, JwtModule.register({ secret: 'secret' })],
      providers: [CategoryResolver, DataLoaderService, KnexService, UserRepository],
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
