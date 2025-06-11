import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { CategoryEntity } from './category.entity';
import { UserEntity } from './user.entity';

describe('Category entity', () => {
  let repository: Repository<CategoryEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    repository = moduleRef.get(getRepositoryToken(CategoryEntity));

    const userRepository = moduleRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    const user1 = userRepository.create({
      id: 1,
      username: 'testuser1',
      passwordHash: 'testpassword1',
    });
    await userRepository.save(user1);

    const user2 = userRepository.create({
      id: 2,
      username: 'testuser2',
      passwordHash: 'testpassword2',
    });
    await userRepository.save(user2);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should unique userId and name', async () => {
    const category1 = repository.create({ userId: 1, name: 'Category 1' });
    const category2 = repository.create({ userId: 1, name: 'Category 1' });
    await repository.save(category1);
    await expect(repository.save(category2)).rejects.toThrow(
      'SQLITE_CONSTRAINT: UNIQUE constraint failed: category_entity.userId, category_entity.name',
    );

    const category3 = repository.create({ userId: 2, name: 'Category 1' });
    await repository.save(category3);

    const category4 = repository.create({ userId: 1, name: 'Category 2' });
    await repository.save(category4);

    const categories = await repository.find();
    expect(categories.map((c) => c.name)).toEqual(['Category 1', 'Category 1', 'Category 2']);
    expect(categories.map((c) => c.userId)).toEqual([1, 2, 1]);
  });
});
