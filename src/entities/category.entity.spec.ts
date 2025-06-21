import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OrmModule } from '../orm/orm.module';
import { CategoryEntity } from './category.entity';
import { UserEntity } from '.';

describe('Category entity', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrmModule],
    }).compile();

    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();

    em = moduleRef.get(EntityManager);

    await em
      .fork()
      .persist(
        em.create(UserEntity, {
          id: 1,
          username: 'testuser1',
          passwordHash: 'testpassword1',
        }),
      )
      .flush();
    await em
      .fork()
      .persist(
        em.create(UserEntity, {
          id: 2,
          username: 'testuser2',
          passwordHash: 'testpassword2',
        }),
      )
      .flush();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should unique user and name', async () => {
    const user1 = await em.findOneOrFail(UserEntity, { id: 1 });

    const category1 = new CategoryEntity();
    category1.user = user1;
    category1.name = 'Test Category 1';

    await em.fork().persist(category1).flush();

    const category2 = new CategoryEntity();
    category2.user = user1;
    category2.name = 'Test Category 1';
    await expect(em.fork().persist(category2).flush()).rejects.toThrow();

    const user2 = await em.findOneOrFail(UserEntity, { id: 2 });
    const category3 = new CategoryEntity();
    category3.user = user2;
    category3.name = 'Test Category 1';
    await em.fork().persist(category3).flush();
  });
});
