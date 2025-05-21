import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Category, Feed } from 'knex/types/tables';
import { KnexService } from '../knex.service';

export type CreateFeed = Omit<Feed, 'id' | 'created_at' | 'updated_at'>;

@Injectable()
export class FeedRepository {
  constructor(private readonly knexService: KnexService) {}

  async create(dto: CreateFeed): Promise<Feed> {
    return await this.knexService.connection.transaction(async (tx) => {
      const [id] = await tx('feeds_composite').insert(dto).into('feeds');
      const feed = await tx('feeds').select('*').where('id', id).first();
      return feed!;
    });
  }

  findByUserId(userId: number): Knex.QueryBuilder<Feed & Category, Feed[]> {
    return this.knexService
      .connection('feeds')
      .join('categories', 'feeds.category_id', 'categories.id')
      .where('categories.user_id', userId)
      .orderBy('feeds.id');
  }
}
