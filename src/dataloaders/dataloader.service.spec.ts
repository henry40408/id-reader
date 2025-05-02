import { Test, TestingModule } from '@nestjs/testing';
import { KnexModule } from '../knex/knex.module';
import { CategoryRepository } from '../repositories/category.repository';
import { UserRepository } from '../repositories/user.repository';
import { knexConfig } from '../test.helper';
import { DataloaderService } from './dataloader.service';

describe('DataloaderService', () => {
  let moduleRef: TestingModule;
  let service: DataloaderService;
  let userRepository: UserRepository;
  let categoryRepository: CategoryRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig)],
      providers: [DataloaderService, UserRepository, CategoryRepository],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<DataloaderService>(DataloaderService);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
    categoryRepository = moduleRef.get<CategoryRepository>(CategoryRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const loaded = await service.loaders.usersLoader.load(user.id);
    expect(loaded.username).toEqual(user.username);
  });

  it('should return a category', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });
    const category = await categoryRepository.create({ name: 'test', user_id: user.id });
    const loaded = await service.loaders.categoriesLoader.load(category.id);
    expect(loaded.name).toEqual(category.name);
  });
});
