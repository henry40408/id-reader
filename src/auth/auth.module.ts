import { Module } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, UserRepository],
  exports: [AuthService, UserRepository],
})
export class AuthModule {}
