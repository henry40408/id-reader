import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { TestingModule, Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { Category, Feed } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';
import { DEFAULT_CATEGORY_NAME } from '../repositories/category.constants';
import { UserRepository } from '../repositories/user.repository';
import { testKnexModule } from '../test.helper';
import { OpmlService } from './opml.service';

describe('OpmlService', () => {
  let moduleRef: TestingModule;
  let service: OpmlService;
  let userRepository: UserRepository;
  let knex: Knex;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [testKnexModule],
      providers: [OpmlService, UserRepository],
    }).compile();
    await moduleRef.init();
    service = moduleRef.get<OpmlService>(OpmlService);
    userRepository = moduleRef.get<UserRepository>(UserRepository);
    knex = moduleRef.get<Knex>(KNEX);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should import feeds', async () => {
    const user = await userRepository.create({ username: 'test', password: 'test' });

    const categories = await service.parseOPML(fs.createReadStream(path.join(__dirname, 'test.opml')));
    await service.importFeeds(user.id, categories);

    const category = await knex<Category>('categories').where('user_id', user.id).first();
    expect(category).toBeDefined();
    expect(category?.name).toEqual('Test Category');

    const feeds = await knex<Feed>('feeds').where('category_id', category?.id).orderBy('id', 'asc');
    expect(feeds).toHaveLength(2);
    expect(feeds.map((f) => f.title)).toEqual(['Test Feed', 'Test Feed 2']);
  });

  it('should parse OPML file', async () => {
    const readable = fs.createReadStream(path.join(__dirname, 'test.opml'));
    const opml = await service.parseOPML(readable);
    expect(opml).toEqual([
      {
        name: 'Test Category',
        feeds: [
          {
            title: 'Test Feed',
            htmlUrl: 'http://test.invalid',
            xmlUrl: 'http://test.invalid/feed',
          },
          {
            title: 'Test Feed 2',
            htmlUrl: 'http://blog.test.invalid',
            xmlUrl: 'http://blog.test.invalid/feed',
          },
        ],
      },
    ]);
  });

  it('should throw an error if the OPML file is invalid', async () => {
    const readable = new Readable();
    readable.push('invalid');
    readable.push(null);
    await expect(service.parseOPML(readable)).rejects.toThrow('Non-whitespace before first tag.');
  });

  it('should parse OPML file with no category', async () => {
    const readable = fs.createReadStream(path.join(__dirname, 'no-category.opml'));
    const opml = await service.parseOPML(readable);
    expect(opml).toEqual([
      {
        name: DEFAULT_CATEGORY_NAME,
        feeds: [
          {
            title: 'Test Feed',
            htmlUrl: 'http://test.invalid',
            xmlUrl: 'http://test.invalid/feed',
          },
          {
            title: 'Test Feed 2',
            htmlUrl: 'http://blog.test.invalid',
            xmlUrl: 'http://blog.test.invalid/feed',
          },
        ],
      },
    ]);
  });
});
