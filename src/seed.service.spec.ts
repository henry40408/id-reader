import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { KnexService } from './knex.service';
import { AppConfigModule } from './app-config/app-config.module';
import { UserRepository } from './repository/user.repository';

describe('SeedModule', () => {
  let moduleRef: TestingModule;
  let service: SeedService;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [KnexService, UserRepository, SeedService],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<SeedService>(SeedService);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed the database', async () => {
    await service.seed();
  });
});
