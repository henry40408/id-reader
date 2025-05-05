import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Request } from 'express';

@ObjectType({ description: 'JSON web token payload' })
export class JwtPayload {
  @Field(() => String, { description: 'User ID' })
  sub!: string;

  @Field(() => String, { description: 'Username' })
  username!: string;
}

export type RequestWithPayload = Request & { jwtPayload: JwtPayload };

@InputType({ description: 'Sign in input' })
export class SignInInput {
  @Field(() => String, { description: 'Username' })
  username!: string;

  @Field(() => String, { description: 'Password' })
  password!: string;
}
