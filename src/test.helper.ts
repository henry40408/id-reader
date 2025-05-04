import { TestingModule } from '@nestjs/testing';
import { ConfigModuleOptions } from './knex/knex.interface';
import { UserRepository } from './knex/repository/user.repository';

export const knexConfig: ConfigModuleOptions = {
  knex: {
    client: 'sqlite',
    connection: {
      filename: ':memory:',
    },
    useNullAsDefault: true,
  },
};

let userCount = 0;
export async function createUser(moduleRef: TestingModule) {
  const userRepository = moduleRef.get<UserRepository>(UserRepository);
  const user = await userRepository.create({ username: `test_${userCount + 1}`, password: 'test' });
  userCount += 1;
  return user;
}
