import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
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
    const user = await userRepository.create({ username: 'test', password: 'test' });
    expect(user.username).toEqual('test');
    expect(user.password_hash).not.toEqual('test');

    await expect(bcrypt.compare('test', user.password_hash)).resolves.toBe(true);
  });
});
