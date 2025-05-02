import { Test, TestingModule } from '@nestjs/testing';
import { KnexModule } from '../knex/knex.module';
import { knexConfig } from '../test.helper';
import { CategoryRepository } from './category.repository';
import { FeedRepository } from './feed.repository';
import { UserRepository } from './user.repository';

describe('FeedRepository', () => {
  let moduleRef: TestingModule;
  let repository: FeedRepository;
  let categoryRepository: CategoryRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig)],
      providers: [FeedRepository, CategoryRepository, UserRepository],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<FeedRepository>(FeedRepository);
    categoryRepository = moduleRef.get<CategoryRepository>(CategoryRepository);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should count feeds', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    await repository.create({ category_id: category.id, title: 'Test Feed', xml_url: 'https://test.com/feed' });
    const count = await repository.count(user.id);
    expect(count).toEqual(1);
  });

  it('should create a feed', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    const feed = await repository.create({
      category_id: category.id,
      title: 'Test Feed',
      xml_url: 'https://test.com/feed',
    });
    expect(feed).toBeDefined();
    expect(feed.title).toEqual('Test Feed');
    expect(feed.xml_url).toEqual('https://test.com/feed');
  });

  it('should not create a feed with the same xml_url', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    const data = { category_id: category.id, title: 'Test Feed', xml_url: 'https://test.com/feed' };
    await repository.create(data);
    await expect(repository.create(data)).rejects.toThrow('UNIQUE constraint failed');
  });
});
