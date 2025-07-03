import { ObjectType, Field, InputType } from '@nestjs/graphql';

@ObjectType({ description: 'The JWT payload object' })
export class JwtPayloadObject {
  @Field({ description: 'The user ID from the JWT payload' })
  sub!: number;

  @Field({ description: 'The username from the JWT payload' })
  username!: string;
}

@InputType({ description: 'Sign in credentials' })
export class SignInInput {
  @Field({ description: 'The username of the user' })
  username!: string;

  @Field({ description: 'The password of the user' })
  password!: string;
}

@ObjectType({ description: 'User object' })
export class UserObject {
  @Field({ description: 'The unique identifier of the user' })
  id!: number;

  @Field({ description: 'The username of the user' })
  username!: string;

  @Field({ description: 'The date when the user was created' })
  createdAt!: Date;

  @Field({ description: 'The date when the user was last updated' })
  updatedAt!: Date;
}

@ObjectType({ description: 'Category object' })
export class CategoryObject {
  @Field({ description: 'The unique identifier of the category' })
  id!: number;

  @Field({ description: 'The name of the category' })
  name!: string;

  @Field(() => [FeedObject], { description: 'The feeds associated with the category', nullable: true })
  feeds?: FeedObject[];

  @Field(() => UserObject, { description: 'The user who owns the category' })
  user!: UserObject;

  @Field({ description: 'The date when the category was created' })
  createdAt!: Date;

  @Field({ description: 'The date when the category was last updated' })
  updatedAt!: Date;
}

@ObjectType({ description: 'Image object' })
export class ImageObject {
  @Field({ description: 'The unique identifier of the image' })
  id!: number;

  @Field({ description: 'The URL of the image' })
  url!: string;

  @Field({ description: 'The content type of the image' })
  contentType!: string;

  @Field({ description: 'The SHA-256 checksum of the image', nullable: true })
  sha256sum!: string;

  @Field({ description: 'The ETag of the image', nullable: true })
  etag?: string;

  @Field({ description: 'The last modified date of the image', nullable: true })
  lastModified?: string;

  @Field({ description: 'The date when the image was created' })
  createdAt!: Date;

  @Field({ description: 'The date when the image was last updated' })
  updatedAt!: Date;
}

@ObjectType({ description: 'Feed object' })
export class FeedObject {
  @Field({ description: 'The unique identifier of the feed' })
  id!: number;

  @Field({ description: 'The title of the feed' })
  title!: string;

  @Field({ description: 'The URL of the feed' })
  url!: string;

  @Field({ description: 'The link of the feed', nullable: true })
  link: string;

  @Field(() => UserObject, { description: 'The user who owns the feed' })
  user!: UserObject;

  @Field(() => CategoryObject, { description: 'The category of the feed' })
  category!: CategoryObject;

  @Field({ description: 'The image associated with the feed', nullable: true })
  image?: ImageObject;

  @Field(() => [EntryObject], { description: 'The entries associated with the feed', nullable: true })
  entries?: EntryObject[];

  @Field({ description: 'The date when the feed was created' })
  createdAt!: Date;

  @Field({ description: 'The date when the feed was last updated' })
  updatedAt!: Date;
}

@ObjectType({ description: 'Entry object' })
export class EntryObject {
  @Field({ description: 'The unique identifier of the entry' })
  id!: number;

  @Field({ description: 'The globally unique identifier of the entry' })
  guid!: string;

  @Field({ description: 'The title of the entry' })
  title!: string;

  @Field({ description: 'The publication date of the entry' })
  isoDate!: Date;

  @Field({ description: 'The content of the entry', nullable: true })
  content?: string;

  @Field({ description: 'The summary of the entry', nullable: true })
  summary?: string;

  @Field({ description: 'The link to the entry', nullable: true })
  link?: string;

  @Field({ description: 'The creator of the entry', nullable: true })
  creator?: string;

  @Field(() => [String], { description: 'The categories associated with the entry', nullable: true })
  categories?: string[];

  @Field({ description: 'The date when the entry was created' })
  createdAt!: Date;

  @Field({ description: 'The date when the entry was last updated' })
  updatedAt!: Date;

  @Field(() => FeedObject, { description: 'The feed to which the entry belongs' })
  feed!: FeedObject;

  @Field(() => UserObject, { description: 'The user who owns the entry' })
  user!: UserObject;
}
