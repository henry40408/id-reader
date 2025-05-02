import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import nock from 'nock';
import { KnexModule } from '../knex/knex.module';
import { knexConfig } from '../test.helper';
import { ImageRepository } from './image.repository';

const IMAGE_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+U4T8ABu8CpCYJ1DQAAAAASUVORK5CYII=',
  'base64',
);

describe('ImageRepository', () => {
  let moduleRef: TestingModule;
  let repository: ImageRepository;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [KnexModule.register(knexConfig), HttpModule],
      providers: [ImageRepository],
    }).compile();
    await moduleRef.init();
    repository = moduleRef.get<ImageRepository>(ImageRepository);
  });

  afterEach(async () => {
    if (moduleRef) await moduleRef.close();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create an image', async () => {
    nock('https://example.com').get('/image.png').reply(200, IMAGE_1x1);

    const image = await repository.create('https://example.com/image.png');
    expect(image).toBeDefined();
    expect(image.url).toEqual('https://example.com/image.png');
    expect(image.blob).toEqual(IMAGE_1x1);
  });

  it('should find an image by URL', async () => {
    nock('https://example.com').get('/image.png').reply(200, IMAGE_1x1);

    await repository.create('https://example.com/image.png');
    const foundImage = await repository.findByUrl('https://example.com/image.png');
    expect(foundImage).toBeDefined();
    expect(foundImage?.url).toEqual('https://example.com/image.png');
    expect(foundImage?.blob).toEqual(IMAGE_1x1);
  });
});
