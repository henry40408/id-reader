import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { OrmModule } from '../orm/orm.module';
import { UserEntity } from '.';

describe('User entity', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrmModule],
    }).compile();
    em = moduleRef.get(EntityManager);

    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should hash password before insert', async () => {
    const user = new UserEntity();
    user.username = 'testuser';
    user.password = 'password';

    await em.fork().persist(user).flush();

    const found = await em.findOneOrFail(UserEntity, { id: user.id });

    const hash = found.passwordHash;
    await expect(bcrypt.compare(user.password, hash)).resolves.toBeTruthy();
  });
});
