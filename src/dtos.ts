import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

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
