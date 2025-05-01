import { Request } from 'express';
import { JwtPayload } from '../dtos';

export type RequestWithJwtPayload = Request & { jwtPayload: JwtPayload };
