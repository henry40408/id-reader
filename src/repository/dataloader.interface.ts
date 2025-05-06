import DataLoader from 'dataloader';
import { User } from 'knex/types/tables';

export interface IDataLoaders {
  usersLoader: DataLoader<number, User>;
}
