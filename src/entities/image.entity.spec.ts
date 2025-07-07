import { EntityManager, MikroORM } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { OrmModule } from '../orm/orm.module';
import { PNG_1x1, PNG_1x1_SHA256SUM } from '../test.helper';
import { ImageEntity } from '.';

describe('Image entity', () => {
  let moduleRef: TestingModule;
  let em: EntityManager;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [OrmModule],
    }).compile();
    em = moduleRef.get(EntityManager);

    const orm = moduleRef.get(MikroORM);
    await orm.schema.refreshDatabase();
  });

  afterEach(async () => {
    await moduleRef.close();
  });

  it('should be defined', () => {
    expect(em).toBeDefined();
  });

  it('should save an image', async () => {
    await em
      .fork()
      .persist(
        em.create(ImageEntity, {
          url: 'https://example.com/image.png',
          blob: PNG_1x1,
          contentType: 'image/png',
        }),
      )
      .flush();

    const found = await em.findOneOrFail(ImageEntity, { url: 'https://example.com/image.png' });
    expect(found).toMatchObject({
      url: 'https://example.com/image.png',
      blob: PNG_1x1,
      contentType: 'image/png',
      sha256sum: PNG_1x1_SHA256SUM,
    });
  });
});
