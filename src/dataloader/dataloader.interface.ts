import DataLoader from 'dataloader';
import { Category, Image, User } from 'knex/types/tables';

export interface IDataLoaders {
  categoryLoader: DataLoader<number, Category>;
  imageLoader: DataLoader<number, Image>;
  userLoader: DataLoader<number, User>;
}
