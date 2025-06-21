import { ObjectType, Field, InputType } from '@nestjs/graphql';

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

  @Field(() => UserObject, { description: 'The user who owns the category' })
  user!: UserObject;

  @Field({ description: 'The date when the category was created' })
  createdAt!: Date;

  @Field({ description: 'The date when the category was last updated' })
  updatedAt!: Date;
}
