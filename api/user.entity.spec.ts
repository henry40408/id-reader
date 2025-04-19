import * as bcrypt from 'bcrypt';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '@nestjs/testing';
import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          database: ':memory:',
          entities: [UserEntity],
          synchronize: true,
          type: 'better-sqlite3',
        }),
        TypeOrmModule.forFeature([UserEntity]),
      ],
    }).compile();
    repository = app.get(getRepositoryToken(UserEntity));
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
