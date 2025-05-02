import DataLoader from 'dataloader';
import { Category, User } from 'knex/types/tables';

export interface IDataLoaders {
  categoriesLoader: DataLoader<number, Category>;
  usersLoader: DataLoader<number, User>;
}
