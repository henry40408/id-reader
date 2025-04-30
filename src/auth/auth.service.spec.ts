import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repositories/user.repository';
import { testKnexModule } from '../test.helper';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let moduleRef: TestingModule;
  let repository: UserRepository;
  let service: AuthService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [testKnexModule, AuthModule],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<UserRepository>(UserRepository);
    service = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate user', async () => {
    await repository.createUser({ username: 'test', password: 'test' });
    const user = await service.validate({ username: 'test', password: 'test' });
    expect(user).toBeDefined();
  });

  it('should not validate user', async () => {
    await repository.createUser({ username: 'test', password: 'test' });
    const user = await service.validate({ username: 'test', password: 'wrong' });
    expect(user).toBeUndefined();
  });
});
