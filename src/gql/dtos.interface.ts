import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Request } from 'express';
import { Category, Feed, Image, User } from 'knex/types/tables';

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

@ObjectType({ description: 'Feed object' })
export class FeedObject implements Feed {
  @Field(() => Number, { description: 'Feed ID' })
  id!: number;

  category_id!: number;

  @Field(() => String, { description: 'Title' })
  title!: string;

  @Field(() => String, { description: 'Description', nullable: true })
  description?: string | undefined;

  @Field(() => String, { description: 'XML URL' })
  xml_url!: string;

  @Field(() => String, { description: 'HTML URL', nullable: true })
  html_url?: string | undefined;

  image_id?: number | undefined;

  @Field(() => Date, { description: 'Created at' })
  created_at: string;

  @Field(() => Date, { description: 'Updated at' })
  updated_at: string;
}

@ObjectType({ description: 'Image object' })
export class ImageObject implements Image {
  @Field(() => Number, { description: 'Image ID' })
  id!: number;

  @Field(() => String, { description: 'URL' })
  url!: string;

  blob!: Buffer;

  @Field(() => String, { description: 'Content type' })
  content_type!: string;

  @Field(() => String, { description: 'ETag', nullable: true })
  etag?: string | undefined;

  @Field(() => String, { description: 'Last modified', nullable: true })
  last_modified?: string | undefined;

  @Field(() => Date, { description: 'Created at' })
  created_at: string;

  @Field(() => Date, { description: 'Updated at' })
  updated_at: string;
}

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
