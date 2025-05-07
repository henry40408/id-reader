import { TestingModule, Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { createUser } from '../test.helper';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';

describe('AuthService', () => {
  let moduleRef: TestingModule;
  let service: AuthService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sign in', async () => {
    const user = await createUser(moduleRef);
    const result = await service.signIn({ username: user.username, password: 'test' });
    expect(result).toBeDefined();

    const result2 = await service.signInOrFail({ username: user.username, password: 'test' });
    expect(result2).toBeDefined();
  });

  it('should not sign in', async () => {
    await expect(service.signIn({ username: 'test', password: 'test' })).resolves.toBeNull();
    await expect(service.signInOrFail({ username: 'test', password: 'test' })).rejects.toThrow(UnauthorizedException);
  });
});
