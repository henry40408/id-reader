import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Feed } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';

@Injectable()
export class FeedRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(dto: Knex.DbRecordArr<Feed>): Promise<Feed> {
    const [id] = await this.knex<Feed>('feeds').insert(dto);
    const feed = await this.knex<Feed>('feeds').where('id', id).first();
    return feed!;
  }
}
