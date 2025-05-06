import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { milliseconds } from 'date-fns';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { AppConfigService } from '../app-config/app-config.service';
import { JwtPayload, RequestWithPayload, SignInInput } from './dtos';
import { GqlContext } from './gql.interface';
import { Authenticated } from './access-token.guard';
import { COOKIE_ACCESS_TOKEN } from './auth.constant';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Query(() => JwtPayload, { description: 'Get current user' })
  @Authenticated()
  currentUser(@Context() context: GqlContext<RequestWithPayload>) {
    return context.req.jwtPayload;
  }

  @Mutation(() => JwtPayload, { description: 'Sign in' })
  async signIn(
    @Context() context: GqlContext<RequestWithPayload>,
    @Args('input') input: SignInInput,
  ): Promise<JwtPayload> {
    const user = await this.authService.signIn(input);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = { sub: String(user.id), username: user.username };
    const token = this.jwtService.sign(payload,{
      expiresIn: this.appConfigService.config.jwt.expiresInSeconds,
    });
    context.res.cookie(COOKIE_ACCESS_TOKEN, token, {
      httpOnly: true,
      maxAge: milliseconds({ seconds: this.appConfigService.config.jwt.expiresInSeconds }),
      sameSite: 'lax',
      secure: this.appConfigService.config.env.production,
    });

    return payload;
  }

  @Mutation(() => Boolean, { description: 'Sign out' })
  @Authenticated()
  signOut(@Context() context: GqlContext<RequestWithPayload>) {
    context.res.clearCookie(COOKIE_ACCESS_TOKEN);
    return true;
  }
}
