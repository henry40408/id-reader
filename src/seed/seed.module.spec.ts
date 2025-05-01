import { TestingModule, Test } from '@nestjs/testing';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

describe('SeedModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [SeedModule],
    }).compile();
    await moduleRef.init();
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should seed the database', async () => {
    const seedService = moduleRef.get<SeedService>(SeedService);
    await seedService.seed();
  });
});
