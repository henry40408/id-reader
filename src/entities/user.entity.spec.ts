import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('User entity', () => {
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    repository = moduleRef.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should hash password before insert', async () => {
    const user = new UserEntity();
    user.username = 'testuser';
    user.password = 'password';

    const saved = await repository.save(user);
    const found = await repository.findOneByOrFail({ id: saved.id });

    const hash = found.passwordHash;
    await expect(bcrypt.compare(user.password, hash)).resolves.toBeTruthy();
  });
});
