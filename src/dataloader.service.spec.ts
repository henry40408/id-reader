import { Test, TestingModule } from '@nestjs/testing';
import { DataLoaderService } from './dataloader.service';
import { KnexService } from './knex.service';
import { AppConfigModule } from './app-config/app-config.module';
import { createCategory, createUser } from './test.helper';
import { UserRepository } from './repository/user.repository';
import { CategoryRepository } from './repository/category.repository';

describe('DataloaderService', () => {
  let moduleRef: TestingModule;

  let service: DataLoaderService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [CategoryRepository, DataLoaderService, KnexService, UserRepository],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<DataLoaderService>(DataLoaderService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new dataloader', () => {
    expect(service.loaders).toBeDefined();
  });

  it('should find user by id', async () => {
    const user = await createUser(moduleRef);
    const found = await service.loaders.userLoader.load(user.id);
    expect(found).toBeDefined();
    expect(found.id).toBe(user.id);
  });

  it('should find category by id', async () => {
    const user = await createUser(moduleRef);
    const category = await createCategory(moduleRef, user);
    const found = await service.loaders.categoryLoader.load(category.id);
    expect(found).toBeDefined();
    expect(found.id).toBe(category.id);
  });
});
