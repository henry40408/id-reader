import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Request } from 'express';
import { Category, User } from 'knex/types/tables';

@ObjectType({ description: 'User object' })
export class UserObject implements User {
  @Field(() => Number, { description: 'User ID' })
  id!: number;

  @Field(() => String, { description: 'username' })
  username!: string;

  password_hash!: string;

  @Field(() => Date, { description: 'Created at' })
  created_at!: string;

  @Field(() => Date, { description: 'Updated at' })
  updated_at!: string;
}

@ObjectType({ description: 'Category object' })
export class CategoryObject implements Category {
  @Field(() => Number, { description: 'Category ID' })
  id!: number;

  user_id!: number;

  @Field(() => String, { description: 'Category name' })
  name!: string;

  @Field(() => Date, { description: 'Created at' })
  created_at: string;

  @Field(() => Date, { description: 'Updated at' })
  updated_at: string;
}

@ObjectType({ description: 'JSON web token payload' })
export class JwtPayload {
  @Field(() => Number, { description: 'User ID' })
  sub!: number;

  @Field(() => String, { description: 'Username' })
  username!: string;
}

export type RequestWithJwtPayload = Request & { jwtPayload: JwtPayload };

@InputType({ description: 'Sign in input' })
export class SignInInput {
  @Field(() => String, { description: 'Username' })
  username!: string;

  @Field(() => String, { description: 'Password' })
  password!: string;
}
