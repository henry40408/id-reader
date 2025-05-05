import { TestingModule } from '@nestjs/testing';
import { UserRepository } from './repository/repository/user.repository';

let userCount = 0;
export async function createUser(moduleRef: TestingModule) {
  const userRepository = moduleRef.get<UserRepository>(UserRepository);
  const user = await userRepository.create({ username: `test_${userCount + 1}`, password: 'test' });
  userCount += 1;
  return user;
}
