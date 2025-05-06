import { Request, Response } from 'express';
import { IDataLoaders } from '../repository/dataloader.interface';

export interface IGqlContext<T = Request> {
  req: T;
  res: Response;
  loaders: IDataLoaders;
}
