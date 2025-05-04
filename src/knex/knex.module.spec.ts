import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';
import { knexConfig } from '../test.helper';
import { KnexModule } from './knex.module';
import { KNEX } from './knex.constant';

describe('KnexModule', () => {
  let moduleRef: TestingModule;
  let knex: Knex;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig)],
    }).compile();
    await moduleRef.init();
    knex = moduleRef.get<Knex>(KNEX);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should have a knex instance', () => {
    expect(knex).toBeDefined();
  });
});
