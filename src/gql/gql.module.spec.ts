import { Test, TestingModule } from '@nestjs/testing';
import { GqlModule } from './gql.module';

describe('GqlModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GqlModule],
    }).compile();
    await module.init();
  });

  afterEach(async () => {
    if (module) await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
