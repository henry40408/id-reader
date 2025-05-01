import { TestingModule, Test } from '@nestjs/testing';
import { testKnexModule } from '../test.helper';
import { CategoryRepository } from './category.repository';
import { UserRepository } from './user.repository';

describe('CategoryRepository', () => {
  let moduleRef: TestingModule;
  let categoryRepository: CategoryRepository;
  let userRepository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [testKnexModule],
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
    expect(category.name).toBe('Test Category');
  });

  it('should not create a category with the same name', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const data = { user_id: user.id, name: 'Test Category' };
    await categoryRepository.create(data);
    await expect(categoryRepository.create(data)).rejects.toThrow('UNIQUE constraint failed');
  });
});
