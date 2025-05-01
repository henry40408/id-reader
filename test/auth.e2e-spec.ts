import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { UserRepository } from 'src/repositories/user.repository';

describe('AuthResolver (e2e)', () => {
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

  it('should sign in, get current user, then sign out', async () => {
    const repository = app.get(UserRepository);
    await repository.create({ username: 'test', password: 'test' });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: 'query { currentUser { username } }' })
      .expect(HttpStatus.OK);

    expect(response.body).toMatchObject({ data: null, errors: [{ message: 'Forbidden resource' }] });

    const response2 = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: 'mutation { signIn(input: { username: "test", password: "test" }) { sub username } }' })
      .expect(HttpStatus.OK)
      .expect({ data: { signIn: { sub: 1, username: 'test' } } });

    const cookie = response2.headers['set-cookie'];

    await request(app.getHttpServer())
      .post('/graphql')
      .set('Cookie', cookie)
      .send({ query: 'query { currentUser { username } }' })
      .expect(HttpStatus.OK)
      .expect({ data: { currentUser: { username: 'test' } } });

    const response3 = await request(app.getHttpServer())
      .post('/graphql')
      .set('Cookie', cookie)
      .send({ query: 'mutation { signOut }' })
      .expect(HttpStatus.OK)
      .expect({ data: { signOut: true } });

    expect(response3.headers['set-cookie']).toEqual(['access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT']);
  });
});
