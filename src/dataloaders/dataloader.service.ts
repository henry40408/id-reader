import { Inject, Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Knex } from 'knex';
import { Category, User } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';
import { IDataLoaders } from './dataloader.interface';

@Injectable()
export class DataloaderService {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  get loaders(): IDataLoaders {
    return {
      categoriesLoader: new DataLoader(async (categoryIds: number[]) => {
        const categories = await this.knex<Category>('categories').whereIn('id', categoryIds);
        return this.reorder(categories, categoryIds);
      }),
      usersLoader: new DataLoader(async (userIds: number[]) => {
        const users = await this.knex<User>('users').whereIn('id', userIds);
        return this.reorder(users, userIds);
      }),
    };
  }

  reorder<T extends { id: number }>(items: T[], ids: number[]) {
    return ids.map((id) => items.find((i) => i.id === id)).filter((i) => !!i);
  }
}
