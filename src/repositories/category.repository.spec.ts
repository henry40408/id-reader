import { TestingModule, Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { Category } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';
import { KnexModule } from '../knex/knex.module';
import { knexConfig } from '../test.helper';
import { DEFAULT_CATEGORY_NAME } from './category.constants';
import { CategoryRepository } from './category.repository';
import { UserRepository } from './user.repository';

describe('CategoryRepository', () => {
  let moduleRef: TestingModule;
  let categoryRepository: CategoryRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig)],
      providers: [CategoryRepository, UserRepository],
    }).compile();
    await moduleRef.init();
    categoryRepository = moduleRef.get<CategoryRepository>(CategoryRepository);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(categoryRepository).toBeDefined();
  });

  it('should create a category', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const category = await categoryRepository.create({ user_id: user.id, name: 'Test Category' });
    expect(category).toBeDefined();
    expect(category.name).toEqual('Test Category');
  });

  it('should not create a category with the same name', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const data = { user_id: user.id, name: 'Test Category' };
    await categoryRepository.create(data);
    await expect(categoryRepository.create(data)).rejects.toThrow('UNIQUE constraint failed');
  });

  it('should create a default category', async () => {
    const knex = moduleRef.get<Knex>(KNEX);

    expect(await knex<Category>('categories').count('id', { as: 'count' })).toEqual([{ count: 0 }]);

    const user = await userRepository.create({ username: 'test', password: 'test' });

    const category = await categoryRepository.findOrCreateDefaultCategory(user.id);
    expect(await knex<Category>('categories').count('id', { as: 'count' })).toEqual([{ count: 1 }]);

    expect(category).toBeDefined();
    expect(category.name).toEqual(DEFAULT_CATEGORY_NAME);

    const category2 = await categoryRepository.findOrCreateDefaultCategory(user.id);
    expect(category2).toEqual(category);

    expect(await knex<Category>('categories').count('id', { as: 'count' })).toEqual([{ count: 1 }]);
  });
});
