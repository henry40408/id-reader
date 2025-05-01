import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Category } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';

@Injectable()
export class CategoryRepository {
  constructor(@Inject(KNEX) private readonly db: Knex) {}

  async create(dto: Knex.DbRecordArr<Category>): Promise<Category> {
    const [id] = await this.db<Category>('categories').insert(dto);
    const category = await this.db<Category>('categories').where('id', id).first();
    return category!;
  }
}
