import * as fs from 'node:fs';
import * as path from 'node:path';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { UserRepository } from 'src/repositories/user.repository';

describe('FeedsController (e2e)', () => {
  let app: INestApplication<App>;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    userRepository = moduleRef.get<UserRepository>(UserRepository);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  it('should import feeds', async () => {
    await userRepository.create({ username: 'test', password: 'test' });

    const response = await request(app.getHttpServer()).post('/graphql').send({
      query: `mutation { signIn(input: { username: "test", password: "test" }) { sub username } }`,
    });
    expect(response.status).toEqual(HttpStatus.OK);
    expect(response.body).toMatchObject({ data: { signIn: { sub: 1, username: 'test' } } });

    const cookie = response.headers['set-cookie'];

    {
      const buffer = fs.readFileSync(path.resolve(__dirname, '../fixtures/test.opml'));
      const response = await request(app.getHttpServer())
        .post('/feeds/import')
        .set('Cookie', cookie)
        .attach('file', buffer, 'test.opml');
      expect(response.status).toEqual(HttpStatus.CREATED);
    }
  });
});
