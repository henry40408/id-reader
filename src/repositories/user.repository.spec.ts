import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { KnexModule } from '../knex/knex.module';
import { knexConfig } from '../test.helper';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let moduleRef: TestingModule;
  let userRepository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig)],
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

  it('should create a user', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    expect(user).toBeDefined();
    expect(user.username).toEqual('test');
  });

  it('should not create a user with the same username', async () => {
    await userRepository.create({ username: 'test', password: 'test' });
    await expect(userRepository.create({ username: 'test', password: 'test' })).rejects.toThrow();
  });

  it('should find a user by username', async () => {
    await userRepository.create({ username: 'test', password: 'test' });
    const user = await userRepository.findByUsername('test');
    expect(user).toBeDefined();
    expect(user?.username).toEqual('test');
  });

  it('should encrypt password before saving', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    expect(user.username).toEqual('test');
    expect(user.password_hash).not.toEqual('test');

    await expect(bcrypt.compare('test', user.password_hash)).resolves.toBe(true);
  });
});
