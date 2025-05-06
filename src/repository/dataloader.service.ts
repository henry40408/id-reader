import { Inject, Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Knex } from 'knex';
import { KNEX } from '../knex/knex.constant';
import { IDataLoaders } from './dataloader.interface';

@Injectable()
export class DataLoaderService {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  get loaders(): IDataLoaders {
    return {
      userLoader: new DataLoader(async (ids: number[]) => {
        const users = await this.knex('users').whereIn('id', ids);
        return this.reorder(ids, users);
      }),
      categoryLoader: new DataLoader(async (ids: number[]) => {
        const categories = await this.knex('categories').whereIn('id', ids);
        return this.reorder(ids, categories);
      }),
    };
  }

  private reorder<T extends { id: number }>(ids: number[], items: T[]) {
    return ids.map((id) => items.find((i) => i.id === id)).filter((i) => !!i);
  }
}
