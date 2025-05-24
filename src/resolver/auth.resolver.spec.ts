import { TestingModule, Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { AppConfigModule } from '../app-config/app-config.module';
import { createUser } from '../test.helper';
import { IGqlContext } from '../graphql.interface';
import { RequestWithJwtPayload } from '../object.interface';
import { KnexService } from '../knex.service';
import { AuthService } from '../auth.service';
import { UserRepository } from '../repository/user.repository';
import { AuthResolver } from './auth.resolver';

describe('AuthResolver', () => {
  let moduleRef: TestingModule;
  let resolver: AuthResolver;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, JwtModule.register({ secret: 'secret' })],
      providers: [AuthResolver, AuthService, KnexService, UserRepository],
    }).compile();
    await moduleRef.init();
    resolver = moduleRef.get<AuthResolver>(AuthResolver);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should sign in', async () => {
    const user = await createUser(moduleRef);
    const context = createMock<IGqlContext<RequestWithJwtPayload>>({
      req: {
        jwtPayload: {
          sub: user.id,
          username: user.username,
        },
      },
      res: {
        cookie: jest.fn(),
      },
    });
    const result = await resolver.signIn(context, {
      username: user.username,
      password: 'test',
    });
    expect(result).toBeDefined();
  });
});
