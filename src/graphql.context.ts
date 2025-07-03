import { Request, Response } from 'express';

export class JwtPayload {
  sub!: number;
  username!: string;
}

export const API_SECURITY_SCHEME = 'cookie';
export const ACCESS_TOKEN_KEY = 'access_token';

export interface GraphQLContext<T = Request> {
  req: T;
  res: Response;
}
