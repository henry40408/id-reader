import { Field, InputType, ObjectType } from '@nestjs/graphql';

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
