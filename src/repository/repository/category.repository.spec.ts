import { Test, TestingModule } from '@nestjs/testing';
import { AppConfigModule } from '../../app-config/app-config.module';
import { createUser } from '../../test.helper';
import { RepositoryModule } from '../repository.module';
import { CategoryRepository } from './category.repository';

describe('CategoryRepository', () => {
  let moduleRef: TestingModule;
  let repository: CategoryRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, RepositoryModule],
      providers: [CategoryRepository],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create a category', async () => {
    const user = await createUser(moduleRef);
    const category = await repository.create({ user_id: user.id, name: 'Test Category' });
    expect(category).toBeDefined();
  });

  it('should not create a category with the same name', async () => {
    const user = await createUser(moduleRef);
    const data = { user_id: user.id, name: 'Test Category' };
    await repository.create(data);
    await expect(repository.create(data)).rejects.toThrow('UNIQUE constraint failed');
  });

  it('should find a category by user id', async () => {
    const user1 = await createUser(moduleRef);
    const user2 = await createUser(moduleRef);

    const category1 = await repository.create({ user_id: user1.id, name: 'Test Category' });
    const category2 = await repository.create({ user_id: user2.id, name: 'Test Category' });

    const categories1 = await repository.findByUserId(user1.id);
    expect(categories1).toBeDefined();
    expect(categories1.length).toBe(1);
    expect(categories1[0].id).toBe(category1.id);
    expect(categories1[0].name).toBe('Test Category');
    expect(categories1[0].user_id).toBe(user1.id);

    const categories2 = await repository.findByUserId(user2.id);
    expect(categories2).toBeDefined();
    expect(categories2.length).toBe(1);
    expect(categories2[0].id).toBe(category2.id);
    expect(categories2[0].name).toBe('Test Category');
    expect(categories2[0].user_id).toBe(user2.id);
  });
});
