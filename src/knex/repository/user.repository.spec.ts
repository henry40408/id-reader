import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { KnexModule } from '../knex.module';
import { UserRepository } from './user.repository';
import { knexConfig } from 'src/test.helper';

describe('UserRepository', () => {
  let moduleRef: TestingModule;
  let repository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig)],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create a user', async () => {
    const user = await repository.create({ username: 'test', password: 'test' });
    expect(user).toBeDefined();
    expect(user.username).toBe('test');
    await expect(bcrypt.compare('test', user.password_hash)).resolves.toBe(true);
  });

  it('should find a user by username', async () => {
    const user = await repository.create({ username: 'test', password: 'test' });
    const foundUser = await repository.findByUsername('test');
    expect(foundUser).toBeDefined();
    expect(foundUser?.id).toBe(user.id);
  });
});
