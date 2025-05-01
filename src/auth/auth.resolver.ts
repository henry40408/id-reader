import { BadRequestException } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { secondsToMilliseconds } from 'date-fns';
import { AppConfigService } from '../app-config/app-config.service';
import { COOKIE_ACCESS_TOKEN } from '../constants';
import { JwtPayload, SignInInput } from '../dtos';
import { GqlContext } from '../interface';
import { Authenticated } from './access-token.guard';
import { RequestWithJwtPayload } from './auth.interface';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => JwtPayload, { description: 'get current user' })
  @Authenticated()
  currentUser(@Context() context: GqlContext<RequestWithJwtPayload>) {
    return context.req.jwtPayload;
  }

  @Mutation(() => JwtPayload, { description: 'sign in' })
  async signIn(@Args('input') input: SignInInput, @Context() context: GqlContext) {
    const user = await this.authService.validate(input);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    const payload: JwtPayload = { sub: user.id, username: user.username };
    const accessToken = this.authService.sign(payload);
    context.res.cookie(COOKIE_ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      maxAge: secondsToMilliseconds(this.appConfigService.config.jwt.expiresInSeconds),
      sameSite: 'lax',
      secure: this.appConfigService.config.env.production,
    });
    return payload;
  }

  @Mutation(() => Boolean, { description: 'sign out' })
  @Authenticated()
  signOut(@Context() context: GqlContext) {
    context.res.clearCookie(COOKIE_ACCESS_TOKEN);
    return true;
  }
}
