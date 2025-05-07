import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { Knex } from 'knex';
import { RepositoryModule } from '../repository.module';
import { KNEX } from '../../knex/knex.constant';
import { IMAGE_1x1 } from '../../test.helper';
import { ImageRepository } from './image.repository';

describe('ImageRepository', () => {
  let moduleRef: TestingModule;
  let repository: ImageRepository;
  let knex: Knex;

  beforeEach(async () => {
    nock.cleanAll();
    nock.disableNetConnect();
    moduleRef = await Test.createTestingModule({
      imports: [RepositoryModule],
      providers: [ImageRepository],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<ImageRepository>(ImageRepository);
    knex = moduleRef.get<Knex>(KNEX);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
    nock.enableNetConnect();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create an image', async () => {
    const scope = nock('http://example.invalid').get('/image.png').reply(200, IMAGE_1x1, {
      'content-type': 'image/png',
    });
    const url = 'http://example.invalid/image.png';
    const image = await repository.create(url);
    expect(image).toBeDefined();
    expect(image.url).toBe(url);
    expect(image.blob).toEqual(IMAGE_1x1);
    expect(image.content_type).toBe('image/png');
    scope.done();
  });

  const countImages = (url: string) => knex('images').count('id', { as: 'count' }).where('url', url).first();

  it('should not create an image if it already exists', async () => {
    const scope = nock('http://example.invalid').get('/image.png').reply(200, IMAGE_1x1, {
      'content-type': 'image/png',
    });
    const url = 'http://example.invalid/image.png';

    await expect(countImages(url)).resolves.toEqual({ count: 0 });

    const image = await repository.create(url);
    expect(image).toBeDefined();
    expect(image.url).toBe(url);
    expect(image.blob).toEqual(IMAGE_1x1);
    expect(image.content_type).toBe('image/png');

    await expect(countImages(url)).resolves.toEqual({ count: 1 });
    await expect(repository.create(url)).resolves.toBeDefined();
    await expect(countImages(url)).resolves.toEqual({ count: 1 });

    scope.done();
  });
});
