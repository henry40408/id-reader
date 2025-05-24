import { Test, TestingModule } from '@nestjs/testing';
import { Feed } from 'knex/types/tables';
import { AppConfigModule } from '../app-config/app-config.module';
import { createUser } from '../test.helper';
import { KnexService } from '../knex.service';
import { OpmlService } from '../opml.service';
import { CreateFeed, FeedRepository } from './feed.repository';
import { CategoryRepository } from './category.repository';
import { UserRepository } from './user.repository';

describe('FeedRepository', () => {
  let moduleRef: TestingModule;
  let categoryRepository: CategoryRepository;
  let repository: FeedRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [CategoryRepository, FeedRepository, KnexService, OpmlService, UserRepository],
    }).compile();
    await moduleRef.init();
    categoryRepository = moduleRef.get<CategoryRepository>(CategoryRepository);
    repository = moduleRef.get<FeedRepository>(FeedRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create a feed', async () => {
    const user = await createUser(moduleRef);
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    const feed = await repository.create({
      user_id: category.user_id,
      category_id: category.id,
      title: 'Test Feed',
      xml_url: 'http://example.invalid/feed',
    });
    expect(feed).toBeDefined();
  });

  it('should not create a feed with the same category ID and xml URL', async () => {
    const user = await createUser(moduleRef);
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    const data: CreateFeed = {
      user_id: category.user_id,
      category_id: category.id,
      title: 'Test Feed',
      xml_url: 'http://example.invalid/feed',
    };
    await expect(repository.create(data)).resolves.toBeDefined();
    await expect(repository.create(data)).rejects.toThrow('UNIQUE constraint failed');
  });

  it('should find feeds by user ID', async () => {
    const user = await createUser(moduleRef);
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    const feed = await repository.create({
      user_id: category.user_id,
      category_id: category.id,
      title: 'Test Feed',
      xml_url: 'http://example.invalid/feed',
    });
    const feeds = await repository.findByUserId(user.id).select<Feed[]>('feeds.*');
    expect(feeds).toHaveLength(1);
    expect(feeds[0].id).toBe(feed.id);
  });
});
