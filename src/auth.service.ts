import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'knex/types/tables';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repository/user.repository';
import { SignInDTO } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signIn(dto: SignInDTO): Promise<User | null> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) return null;
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) return null;
    return user;
  }

  async signInOrFail(dto: SignInDTO): Promise<User> {
    const user = await this.signIn(dto);
    if (!user) throw new UnauthorizedException('Invalid username or password');
    return user;
  }
}
