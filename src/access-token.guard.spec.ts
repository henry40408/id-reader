import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AccessTokenGuard } from './access-token.guard';
import { COOKIE_ACCESS_TOKEN } from './auth.constant';

describe('AccessTokenGuard', () => {
  let moduleRef: TestingModule;
  let guard: AccessTokenGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'secret' })],
      providers: [AccessTokenGuard],
    }).compile();
    guard = moduleRef.get<AccessTokenGuard>(AccessTokenGuard);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false if no token is provided', () => {
    const mocked = createMock<ExecutionContext>({
      getType: () => 'graphql',
    });
    const mockGqlContext = {
      req: {
        cookies: {},
      },
    };
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValueOnce(
      createMock<GqlExecutionContext>({
        getContext: () => mockGqlContext,
      }),
    );
    const result = guard.canActivate(mocked);
    expect(result).toBe(false);
  });

  it('should return true if a valid token is provided', () => {
    const mockedVerify = jest.spyOn(jwtService, 'verify').mockReturnValueOnce({
      sub: '1',
      username: 'test',
    });
    const mocked = createMock<ExecutionContext>({});
    const mockGqlContext = {
      req: {
        cookies: {
          [COOKIE_ACCESS_TOKEN]: 'token',
        },
      },
    };
    jest.spyOn(GqlExecutionContext, 'create').mockReturnValueOnce(
      createMock<GqlExecutionContext>({
        getContext: () => mockGqlContext,
      }),
    );
    const result = guard.canActivate(mocked);
    expect(result).toBe(true);
    expect(mockedVerify).toHaveBeenCalledWith('token');
  });
});
