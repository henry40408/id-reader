import { applyDecorators, CanActivate, ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { COOKIE_ACCESS_TOKEN } from '../constants';
import { JwtPayload } from '../dtos';
import { IGqlContext } from '../interface';
import { RequestWithJwtPayload } from './auth.interface';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);
    const token = request.cookies[COOKIE_ACCESS_TOKEN] as string | undefined;
    if (!token) return false;
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.jwtPayload = payload;
      return true;
    } catch {
      return false;
    }
  }

  private getRequest(context: ExecutionContext): RequestWithJwtPayload {
    if (context.getType() === 'http') return context.switchToHttp().getRequest();
    const ctx: IGqlContext<RequestWithJwtPayload> = GqlExecutionContext.create(context).getContext();
    return ctx.req;
  }
}

export const Authenticated = () => applyDecorators(UseGuards(AccessTokenGuard));
