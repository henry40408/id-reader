import { Test, TestingModule } from '@nestjs/testing';
import { Knex } from 'knex';
import { KnexModule } from './knex.module';
import { KNEX } from './knex.constant';

describe('KnexModule', () => {
  let moduleRef: TestingModule;
  let knex: Knex;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        KnexModule.register({
          knex: {
            client: 'sqlite',
            connection: {
              filename: ':memory:',
            },
            useNullAsDefault: true,
          },
        }),
      ],
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
