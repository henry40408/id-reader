import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  let dataSource: DataSource;
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    dataSource = new DataSource({
      type: 'better-sqlite3',
      database: ':memory:',
      entities: [UserEntity],
      synchronize: true,
    });
    await dataSource.initialize();
    repository = dataSource.getRepository(UserEntity);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(new UserEntity()).toBeDefined();
  });

  it('should hash password', async () => {
    const user = new UserEntity();
    user.username = 'user';
    user.password = 'password';
    expect(user.password).toEqual('password');

    await repository.save(user);
    await expect(bcrypt.compare('password', user.passwordHash)).resolves.toBeTruthy();
  });

  it('should be unique', async () => {
    const user = new UserEntity();
    user.username = 'user';
    user.password = 'password';
    await repository.save(user);

    const user2 = new UserEntity();
    user2.username = 'user';
    user2.password = 'password';
    await expect(repository.save(user2)).rejects.toThrow();
  });
});
