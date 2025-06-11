import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ACCESS_TOKEN_KEY, GraphQLContext, JwtPayload } from './graphql.context';

export type RequestWithUser = Request & { jwtPayload: JwtPayload };

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = this.getRequest(context) as RequestWithUser;

    const accessToken = req.cookies[ACCESS_TOKEN_KEY] as string | undefined;
    if (!accessToken) return false;

    try {
      const payload = this.jwtService.verify<JwtPayload>(accessToken);
      req.jwtPayload = payload;
      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  private getRequest(context: ExecutionContext): Request {
    if (context.getType() === 'http') return context.switchToHttp().getRequest();
    const ctx: GraphQLContext = GqlExecutionContext.create(context).getContext();
    return ctx.req;
  }
}
