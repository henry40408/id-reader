import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { COOKIE_ACCESS_TOKEN } from '../constants';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    expect(AccessTokenGuard).toBeDefined();
  });

  it('should return true if the token is valid', () => {
    const mockVerify = jest.fn().mockReturnValue({ sub: '1', username: 'test' });
    const jwtService = createMock<JwtService>({ verify: mockVerify });

    const guard = new AccessTokenGuard(jwtService);
    const mockContext = createMock<ExecutionContext>({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {
            [COOKIE_ACCESS_TOKEN]: 'test-token',
          },
        }),
      }),
    });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(mockVerify).toHaveBeenCalledWith('test-token');
  });

  it('should return false if the token is missing', () => {
    const mockVerify = jest.fn();
    const jwtService = createMock<JwtService>({ verify: mockVerify });

    const guard = new AccessTokenGuard(jwtService);
    const mockContext = createMock<ExecutionContext>({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });

  it('should return false if the token is invalid', () => {
    const mockVerify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });
    const jwtService = createMock<JwtService>({ verify: mockVerify });

    const guard = new AccessTokenGuard(jwtService);
    const mockContext = createMock<ExecutionContext>({
      getType: () => 'http',
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(false);
  });
});
