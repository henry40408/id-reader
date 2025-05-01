import { Inject, Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Knex } from 'knex';
import { User } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';
import { IDataLoaders } from './dataloader.interface';

@Injectable()
export class DataloaderService {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  get loaders(): IDataLoaders {
    return {
      usersLoader: new DataLoader(async (userIds: number[]) => {
        const users = await this.knex<User>('users').whereIn('id', userIds);
        return userIds.map((id) => users.find((user) => user.id === id)).filter((user) => !!user);
      }),
    };
  }
}
