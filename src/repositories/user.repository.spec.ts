import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcrypt';
import { testKnexModule } from '../test.helper';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let moduleRef: TestingModule;
  let userRepository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [testKnexModule],
      providers: [UserRepository],
    }).compile();
    await moduleRef.init();
    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should encrypt password before saving', async () => {
    const user = await userRepository.createUser({
      username: 'test',
      password: 'test',
    });
    expect(user.password_hash).not.toBe('test');
  });

  it('should hash password', async () => {
    const hash = await userRepository.hash('test');
    await expect(bcrypt.compare('test', hash)).resolves.toBe(true);
  });
});
