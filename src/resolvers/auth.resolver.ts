import { EntityManager } from '@mikro-orm/core';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Context, Field, InputType, Mutation, ObjectType, Query, Resolver } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { secondsToMilliseconds } from 'date-fns';
import { AppConfigService } from '../app-config.module';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { UserEntity } from '../entities';
import { ACCESS_TOKEN_KEY, GraphQLContext, JwtPayload } from '../graphql.context';

@ObjectType({ description: 'The JWT payload object' })
export class JwtPayloadObject {
  @Field({ description: 'The user ID from the JWT payload' })
  sub!: number;
}

@InputType({ description: 'Sign in credentials' })
export class SignInInput {
  @Field({ description: 'The username of the user' })
  username!: string;

  @Field({ description: 'The password of the user' })
  password!: string;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly em: EntityManager,
    private readonly appConfigService: AppConfigService,
    private readonly jwtService: JwtService,
  ) {}

  @Query(() => JwtPayloadObject, { description: 'Get the current user from the JWT payload' })
  @UseGuards(AuthGuard)
  currentUser(@Context() ctx: GraphQLContext<RequestWithUser>): JwtPayloadObject {
    return { sub: ctx.req.jwtPayload.sub };
  }

  @Mutation(() => JwtPayloadObject, { description: 'Sign in a user and return a JWT payload' })
  async signIn(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('input') input: SignInInput,
  ): Promise<JwtPayloadObject> {
    const found = await this.em.findOneOrFail(UserEntity, { username: input.username });
    if (!found) throw new BadRequestException('Invalid username or password');

    const valid = await bcrypt.compare(input.password, found.passwordHash);
    if (!valid) throw new BadRequestException('Invalid username or password');

    const payload: JwtPayload = { sub: found.id };
    const accessToken = this.jwtService.sign(payload);
    ctx.res.cookie(ACCESS_TOKEN_KEY, accessToken, {
      httpOnly: true,
      maxAge: secondsToMilliseconds(this.appConfigService.config.jwt.expiresIn),
      sameSite: 'lax',
    });

    return { sub: found.id };
  }

  @Mutation(() => Boolean, { description: 'Sign out the current user' })
  @UseGuards(AuthGuard)
  signOut(@Context() ctx: GraphQLContext<RequestWithUser>): boolean {
    ctx.res.clearCookie(ACCESS_TOKEN_KEY);
    return true;
  }
}
