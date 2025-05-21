import { Injectable } from '@nestjs/common';
import { Category } from 'knex/types/tables';
import { KnexService } from '../knex.service';

@Injectable()
export class CategoryRepository {
  constructor(private readonly knexService: KnexService) {}

  async create(data: Pick<Category, 'user_id' | 'name'>): Promise<Category> {
    return await this.knexService.connection.transaction(async (tx) => {
      const [id] = await tx('categories_composite').insert(data).into('categories');
      const category = await tx('categories').where('id', id).first();
      return category!;
    });
  }

  async findByUserId(userId: number): Promise<Category[]> {
    return await this.knexService.connection('categories').where('user_id', userId);
  }
}
