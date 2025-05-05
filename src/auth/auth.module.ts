import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { AuthService } from './auth.service';

@Module({
  imports: [RepositoryModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
