import * as fs from 'node:fs';
import * as path from 'node:path';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createUserAndSignIn } from './test.helper';

describe('FeedsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('should import feeds', async () => {
    const cookie = await createUserAndSignIn(app);
    const buffer = fs.readFileSync(path.resolve(__dirname, '../fixtures/test.opml'));
    const response = await request(app.getHttpServer())
      .post('/feeds/import')
      .set('Cookie', cookie)
      .attach('file', buffer, 'test.opml');
    expect(response.status).toEqual(HttpStatus.CREATED);
  });

  it('should get categories', async () => {
    const cookie = await createUserAndSignIn(app);
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { categories { id name } }`,
      })
      .set('Cookie', cookie)
      .expect(HttpStatus.OK)
      .expect({ data: { categories: [] } });
  });

  it('should get feeds', async () => {
    const cookie = await createUserAndSignIn(app);
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `query { feeds { id title } }`,
      })
      .set('Cookie', cookie)
      .expect(HttpStatus.OK)
      .expect({ data: { feeds: [] } });
  });
});
