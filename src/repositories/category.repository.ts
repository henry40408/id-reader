import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Category } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';
import { DEFAULT_CATEGORY_NAME } from './category.constants';

@Injectable()
export class CategoryRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async count(userId: number): Promise<number> {
    return this.knex<Category>('categories')
      .where('user_id', userId)
      .count('id', { as: 'count' })
      .first()
      .then((res) => Number(res?.count ?? 0));
  }

  async create(dto: Knex.DbRecordArr<Category>): Promise<Category> {
    return this.knex.transaction(async (tx) => {
      const [id] = await tx<Category>('categories').insert(dto);
      const category = await tx<Category>('categories').where('id', id).first();
      return category!;
    });
  }

  async findOrCreateDefaultCategory(userId: number): Promise<Category> {
    return this.knex.transaction(async (tx) => {
      const [id] = await tx<Category>('categories')
        .insert({ user_id: userId, name: DEFAULT_CATEGORY_NAME })
        .onConflict(['user_id', 'name'])
        .ignore();
      const category = await tx<Category>('categories').where('id', id).first();
      return category!;
    });
  }
}
