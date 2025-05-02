import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserRepository } from '../src/repositories/user.repository';

export const createUserAndSignIn = async (app: INestApplication<App>) => {
  const userRepository = app.get(UserRepository);
  await userRepository.create({ username: 'test', password: 'test' });

  const response = await request(app.getHttpServer()).post('/graphql').send({
    query: `mutation { signIn(input: { username: "test", password: "test" }) { sub username } }`,
  });
  return response.headers['set-cookie'];
};
