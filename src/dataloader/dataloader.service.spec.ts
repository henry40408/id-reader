import { Test, TestingModule } from '@nestjs/testing';
import { Category } from 'knex/types/tables';
import { Knex } from 'knex';
import { RepositoryModule } from '../repository/repository.module';
import { DataLoaderService } from './dataloader.service';
import { createUser } from 'src/test.helper';
import { KNEX } from 'src/knex/knex.constant';

describe('DataloaderService', () => {
  let moduleRef: TestingModule;

  let service: DataLoaderService;
  let knex: Knex;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [DataLoaderService],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<DataLoaderService>(DataLoaderService);
    knex = moduleRef.get<Knex>(KNEX);
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
    const [categoryId] = await knex<Category>('categories').insert({
      user_id: user.id,
      name: 'Test Category',
    });
    const found = await service.loaders.categoryLoader.load(categoryId);
    expect(found).toBeDefined();
    expect(found.id).toBe(categoryId);
  });
});
