import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Feed } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';

@Injectable()
export class FeedRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async count(userId: number): Promise<number> {
    return this.knex<Feed>('feeds')
      .join('categories', 'feeds.category_id', 'categories.id')
      .where('categories.user_id', userId)
      .count('feeds.id', { as: 'count' })
      .first()
      .then((res) => Number(res?.count ?? 0));
  }

  async create(dto: Knex.DbRecordArr<Feed>): Promise<Feed> {
    return this.knex.transaction(async (tx) => {
      const [id] = await tx<Feed>('feeds').insert(dto);
      const feed = await tx<Feed>('feeds').where('id', id).first();
      return feed!;
    });
  }
}
