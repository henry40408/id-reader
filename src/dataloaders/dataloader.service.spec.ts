import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repositories/user.repository';
import { testKnexModule } from '../test.helper';
import { DataloaderService } from './dataloader.service';

describe('DataloaderService', () => {
  let moduleRef: TestingModule;
  let service: DataloaderService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [testKnexModule],
      providers: [DataloaderService, UserRepository],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<DataloaderService>(DataloaderService);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
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
});
