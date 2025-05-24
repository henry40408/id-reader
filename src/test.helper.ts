import { TestingModule } from '@nestjs/testing';
import { Category, User } from 'knex/types/tables';
import { UserRepository } from './repository/user.repository';
import { CategoryRepository } from './repository/category.repository';
import { FeedRepository } from './repository/feed.repository';

export const IMAGE_1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+U4T8ABu8CpCYJ1DQAAAAASUVORK5CYII=',
  'base64',
);

let userCount = 0;
export async function createUser(moduleRef: TestingModule) {
  const userRepository = moduleRef.get<UserRepository>(UserRepository);
  const user = await userRepository.create({ username: `test_${userCount + 1}`, password: 'test' });
  userCount += 1;
  return user;
}

let categoryCount = 0;
export async function createCategory(moduleRef: TestingModule, user: User) {
  const categoryRepository = moduleRef.get<CategoryRepository>(CategoryRepository);
  const category = await categoryRepository.create({
    name: `Test category #${categoryCount + 1}`,
    user_id: user.id,
  });
  categoryCount += 1;
  return category;
}

let feedCount = 0;
export async function createFeed(
  moduleRef: TestingModule,
  category: Category,
  { htmlUrl, xmlUrl }: { htmlUrl?: string; xmlUrl?: string } = {},
) {
  const feedRepository = moduleRef.get<FeedRepository>(FeedRepository);
  const feed = await feedRepository.create({
    user_id: category.user_id,
    title: `Test feed #${feedCount + 1}`,
    xml_url: xmlUrl ?? `https://example.com/feed?id=${feedCount + 1}`,
    html_url: htmlUrl ?? `https://example.com?id=${feedCount + 1}`,
    category_id: category.id,
  });
  feedCount += 1;
  return feed;
}
