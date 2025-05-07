import { applyDecorators, CanActivate, ExecutionContext, Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IGqlContext } from './gql.interface';
import { JwtPayload, RequestWithJwtPayload } from './dtos.interface';
import { COOKIE_ACCESS_TOKEN } from './auth.constant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly logger = new Logger(AccessTokenGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = this.getRequest(context);
    const token = request.cookies[COOKIE_ACCESS_TOKEN] as string | undefined;
    if (!token) return false;
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      request.jwtPayload = payload;
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }

  private getRequest(context: ExecutionContext): RequestWithJwtPayload {
    if (context.getType() === 'http') return context.switchToHttp().getRequest();
    return GqlExecutionContext.create(context).getContext<IGqlContext<RequestWithJwtPayload>>().req;
  }
}

export const Authenticated = () => applyDecorators(UseGuards(AccessTokenGuard));
