import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AuthGuard } from './auth.guard';
import { ACCESS_TOKEN_KEY } from './graphql.context';

describe('AuthGuard', () => {
  let moduleRef: TestingModule;
  let guard: AuthGuard;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    guard = moduleRef.get(AuthGuard);
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('rejects anonymous requests', () => {
    const request = createMock<ExecutionContext>({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    });
    expect(guard.canActivate(request)).toBe(false);
  });

  it('accepts authorized requests', () => {
    const request = createMock<ExecutionContext>({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: { [ACCESS_TOKEN_KEY]: 'valid-token' },
        }),
      }),
    });
    jest.spyOn(guard['jwtService'], 'verify').mockReturnValue({ userId: 1 });
    expect(guard.canActivate(request)).toBe(true);
  });
});
