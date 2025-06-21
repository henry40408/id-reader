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
