import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Feed } from 'knex/types/tables';
import { InjectKnex } from '../../knex/knex.constant';

export type CreateFeed = Omit<Feed, 'id' | 'created_at' | 'updated_at'>;

@Injectable()
export class FeedRepository {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  async create(dto: CreateFeed): Promise<Feed> {
    return await this.knex.transaction(async (tx) => {
      const [id] = await tx('feeds_composite').insert(dto).into('feeds');
      const feed = await tx('feeds').select('*').where('id', id).first();
      return feed!;
    });
  }
}
