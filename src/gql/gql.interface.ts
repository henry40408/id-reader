import { Request, Response } from 'express';
import { IDataLoaders } from '../dataloader/dataloader.interface';

export interface IGqlContext<T = Request> {
  req: T;
  res: Response;
  loaders: IDataLoaders;
}
