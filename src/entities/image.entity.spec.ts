import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { ImageEntity } from './image.entity';

const PNG_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC',
  'base64',
);

describe('Image entity', () => {
  let repository: Repository<ImageEntity>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    repository = moduleRef.get(getRepositoryToken(ImageEntity));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should save an image', async () => {
    const image = repository.create({
      url: 'https://example.com/image.png',
      blob: PNG_1x1,
      contentType: 'image/png',
    });
    const saved = await repository.save(image);
    const found = await repository.findOneByOrFail({ id: saved.id });
    expect(found).toMatchObject({
      url: 'https://example.com/image.png',
      blob: PNG_1x1,
      contentType: 'image/png',
    });
  });
});
