import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Category, Feed, Image, User } from 'knex/types/tables';

export class ImportFeedsResponse {
  @ApiProperty({ type: Number, description: 'category count' })
  categoryCount!: number;

  @ApiProperty({ type: Number, description: 'feed count' })
  feedCount!: number;
}

@ObjectType()
export class JwtPayload {
  @Field({ description: 'user ID' })
  sub!: number;

  @Field({ description: 'username' })
  username!: string;
}

@InputType()
export class SignInInput {
  @Field({ description: 'username' })
  username!: string;

  @Field({ description: 'password' })
  password!: string;
}

export class UploadedFileDTO {
  @ApiProperty({ type: 'string', format: 'binary', description: 'OPML file' })
  file: Buffer;
}

@ObjectType()
export class ImageObject implements Image {
  @Field({ description: 'image ID' })
  id!: number;

  @Field({ description: 'image URL' })
  url!: string;

  blob!: ArrayBuffer;

  @Field({ description: 'image created at' })
  created_at!: string;

  @Field({ description: 'image updated at' })
  updated_at!: string;
}
@ObjectType()
export class UserObject implements User {
  @Field({ description: 'user ID' })
  id!: number;

  @Field({ description: 'user username' })
  username!: string;

  password_hash!: string;

  @Field({ description: 'user created at' })
  created_at!: string;

  @Field({ description: 'user updated at' })
  updated_at!: string;
}

@ObjectType()
export class CategoryObject implements Category {
  @Field({ description: 'category ID' })
  id!: number;

  user_id!: number;

  @Field({ description: 'category name' })
  name!: string;

  @Field({ description: 'category description' })
  description!: string;

  @Field({ description: 'category created at' })
  created_at!: string;

  @Field({ description: 'category updated at' })
  updated_at!: string;

  @Field(() => UserObject, { description: 'category user' })
  user!: UserObject;
}

@ObjectType()
export class FeedObject implements Feed {
  @Field({ description: 'feed ID' })
  id!: number;

  category_id!: number;

  @Field({ description: 'feed title' })
  title!: string;

  @Field({ description: 'feed description', nullable: true })
  description?: string;

  @Field({ description: 'feed URL' })
  xml_url!: string;

  @Field({ description: 'feed URL', nullable: true })
  html_url?: string;

  image_id?: number;

  @Field({ description: 'feed created at' })
  created_at!: string;

  @Field({ description: 'feed updated at' })
  updated_at!: string;
}
