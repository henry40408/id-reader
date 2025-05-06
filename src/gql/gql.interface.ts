import { Request, Response } from 'express';

export interface IGqlContext<T = Request> {
  req: T;
  res: Response;
}
