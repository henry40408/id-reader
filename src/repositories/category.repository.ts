import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Category } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';
import { DEFAULT_CATEGORY_NAME } from './category.constants';

@Injectable()
export class CategoryRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(dto: Knex.DbRecordArr<Category>): Promise<Category> {
    const [id] = await this.knex<Category>('categories').insert(dto);
    const category = await this.knex<Category>('categories').where('id', id).first();
    return category!;
  }

  async findOrCreateDefaultCategory(userId: number): Promise<Category> {
    const [id] = await this.knex<Category>('categories')
      .insert({ user_id: userId, name: DEFAULT_CATEGORY_NAME })
      .onConflict(['user_id', 'name'])
      .ignore();
    const category = await this.knex<Category>('categories').where('id', id).first();
    return category!;
  }
}
