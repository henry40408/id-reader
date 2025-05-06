import DataLoader from 'dataloader';
import { Category, User } from 'knex/types/tables';

export interface IDataLoaders {
  userLoader: DataLoader<number, User>;
  categoryLoader: DataLoader<number, Category>;
}
