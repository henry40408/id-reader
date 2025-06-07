import fs from 'node:fs';
import path from 'node:path';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { CategoryEntity } from './entities/category.entity';
import { UserEntity } from './entities/user.entity';
import { DEFAULT_CATEGORY_NAME, OpmlService } from './opml.service';

describe('OPML service', () => {
  let moduleRef: TestingModule;
  let service: OpmlService;
  let user: UserEntity;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    service = moduleRef.get<OpmlService>(OpmlService);

    const userRepository = moduleRef.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));

    user = userRepository.create({
      id: 1,
      username: 'testuser',
      passwordHash: 'testpasswordhash',
    });
    await userRepository.save(user);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should import feeds from OPML', async () => {
    const readable = fs.createReadStream(path.join(__dirname, 'feeds.opml'));
    await service.importFeeds(user, readable);

    const categoryRepository = moduleRef.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    await expect(categoryRepository.find({ relations: { feeds: true } })).resolves.toMatchObject([
      {
        userId: user.id,
        name: 'Category 1',
        feeds: [
          { userId: user.id, title: 'Feed 1' },
          { userId: user.id, title: 'Feed 2' },
        ],
      },
      { userId: user.id, name: 'Category 2', feeds: [{ userId: user.id, title: 'Feed 3' }] },
    ]);
  });

  it('should import feeds without category from OPML', async () => {
    const readable = fs.createReadStream(path.join(__dirname, 'feeds-without-category.opml'));
    await service.importFeeds(user, readable);

    const categoryRepository = moduleRef.get<Repository<CategoryEntity>>(getRepositoryToken(CategoryEntity));
    await expect(categoryRepository.find({ relations: { feeds: true } })).resolves.toMatchObject([
      {
        userId: user.id,
        name: DEFAULT_CATEGORY_NAME,
        feeds: [
          { userId: user.id, title: 'Feed 1' },
          { userId: user.id, title: 'Feed 3' },
          { userId: user.id, title: 'Feed 5' },
        ],
      },
      {
        userId: user.id,
        name: 'Category 1',
        feeds: [{ userId: user.id, title: 'Feed 2' }],
      },
      {
        userId: user.id,
        name: 'Category 2',
        feeds: [{ userId: user.id, title: 'Feed 4' }],
      },
    ]);
  });
});
