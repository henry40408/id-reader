import { Inject, Injectable } from '@nestjs/common';
import { Category } from 'knex/types/tables';
import { Knex } from 'knex';
import { KNEX } from '../../knex/knex.constant';

@Injectable()
export class CategoryRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(data: Pick<Category, 'user_id' | 'name'>): Promise<Category> {
    return await this.knex.transaction(async (tx) => {
      const [id] = await tx('categories_composite').insert(data).into('categories');
      const category = await tx('categories').where('id', id).first();
      return category!;
    });
  }

  async findByUserId(userId: number): Promise<Category[]> {
    return await this.knex('categories').where('user_id', userId);
  }
}
