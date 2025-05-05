import { Request, Response } from 'express';

export interface GqlContext<T = Request> {
  req: T;
  res: Response;
}
