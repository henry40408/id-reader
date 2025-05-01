import { Request, Response } from 'express';
import { IDataLoaders } from './dataloaders/dataloader.interface';

export interface IGqlContext<T extends Request = Request> {
  req: T;
  res: Response;
  loaders: IDataLoaders;
}
