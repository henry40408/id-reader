import { Test, TestingModule } from '@nestjs/testing';
import { RepositoryModule } from '../repository/repository.module';
import { DataLoaderService } from './dataloader.service';
import { createCategory, createUser } from 'src/test.helper';

describe('DataloaderService', () => {
  let moduleRef: TestingModule;

  let service: DataLoaderService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [DataLoaderService],
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
