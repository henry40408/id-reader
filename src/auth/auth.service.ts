import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'knex/types/tables';
import { JwtPayload, SignInInput } from '../dtos';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  sign(user: User) {
    const payload: JwtPayload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload);
  }

  async validate(dto: SignInInput): Promise<User | undefined> {
    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) return;
    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) return;
    return user;
  }
}
