import { Request, Response } from 'express';

export class JwtPayload {
  sub!: number;
}

export const ACCESS_TOKEN_KEY = 'access_token';

export interface GraphQLContext<T = Request> {
  req: T;
  res: Response;
}
