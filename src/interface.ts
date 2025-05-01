import { Request, Response } from 'express';

/* istanbul ignore next */
export interface GqlContext<T extends Request = Request> {
  req: T;
  res: Response;
}
