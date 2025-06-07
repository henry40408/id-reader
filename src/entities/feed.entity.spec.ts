import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { CategoryEntity } from './category.entity';
import { FeedEntity } from './feed.entity';
import { UserEntity } from './user.entity';

describe('Feed entity', () => {
  let repository: Repository<FeedEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    repository = moduleRef.get(getRepositoryToken(FeedEntity));

    const userRepository = moduleRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    const user1 = userRepository.create({
      id: 1,
      username: 'testuser',
      passwordHash: 'testpassword',
    });
    await userRepository.save(user1);

    const categoryRepository = moduleRef.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    const category1 = categoryRepository.create({
      id: 1,
      userId: user1.id,
      name: 'Test Category',
    });
    await categoryRepository.save(category1);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should unique by userId, categoryId, and url', async () => {
    const feed1 = repository.create({
      userId: 1,
      categoryId: 1,
      title: 'Test Feed 1',
      url: 'http://example.com/feed1',
    });
    await repository.save(feed1);

    const feed2 = repository.create({
      userId: 1,
      categoryId: 1,
      title: 'Test Feed 2',
      url: 'http://example.com/feed2',
    });
    await repository.save(feed2);

    const duplicateFeed = repository.create({
      userId: 1,
      categoryId: 1,
      title: 'Duplicate Feed',
      url: 'http://example.com/feed1', // Same URL as feed1
    });

    await expect(repository.save(duplicateFeed)).rejects.toThrow(
      'SQLITE_CONSTRAINT: UNIQUE constraint failed: feed_entity.userId, feed_entity.categoryId, feed_entity.url',
    );
  });
});
