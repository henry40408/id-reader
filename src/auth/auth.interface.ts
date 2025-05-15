import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SignInDTO {
  @ApiProperty({ description: 'Username' })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: 'Password' })
  @IsNotEmpty()
  password!: string;
}
