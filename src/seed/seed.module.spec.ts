import { Test, TestingModule } from '@nestjs/testing';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

describe('SeedModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [SeedModule],
    }).compile();
    await module.init();
  });

  afterEach(async () => {
    if (module) await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should seed the database', async () => {
    const seedService = module.get<SeedService>(SeedService);
    await seedService.seed();
  });
});
