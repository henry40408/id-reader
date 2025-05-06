import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from '../../app-config/app-config.module';
import { RepositoryModule } from '../repository.module';
import { createUser } from '../../test.helper';
import { CreateFeed, FeedRepository } from './feed.repository';
import { CategoryRepository } from './category.repository';

describe('FeedRepository', () => {
  let moduleRef: TestingModule;
  let categoryRepository: CategoryRepository;
  let repository: FeedRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, RepositoryModule],
      providers: [FeedRepository],
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
      category_id: category.id,
      title: 'Test Feed',
      xml_url: 'http://example.invalid/feed',
    });
    expect(feed).toBeDefined();
  });

  it('should not create a feed with the same category ID and xml URL', async () => {
    const user = await createUser(moduleRef);
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    const data: CreateFeed = { category_id: category.id, title: 'Test Feed', xml_url: 'http://example.invalid/feed' };
    await expect(repository.create(data)).resolves.toBeDefined();
    await expect(repository.create(data)).rejects.toThrow('UNIQUE constraint failed');
  });
});
