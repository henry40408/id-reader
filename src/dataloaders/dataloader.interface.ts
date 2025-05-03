import DataLoader from 'dataloader';
import { Category, Image, User } from 'knex/types/tables';

export interface IDataLoaders {
  categoriesLoader: DataLoader<number, Category>;
  imagesLoader: DataLoader<number, Image>;
  usersLoader: DataLoader<number, User>;
}
