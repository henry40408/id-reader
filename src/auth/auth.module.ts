import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { UserRepository } from '../repositories/user.repository';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [AppConfigModule],
  providers: [AuthService, UserRepository, AuthResolver],
  exports: [AuthService],
})
export class AuthModule {}
