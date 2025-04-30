import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'knex/types/tables';
import { UserRepository } from '../repositories/user.repository';

export type ValidateDTO = { username: string; password: string };

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(dto: ValidateDTO): Promise<User> {
    const e = new BadRequestException('invalid username or password');

    const user = await this.userRepository.findByUsername(dto.username);
    if (!user) throw e;

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw e;

    return user;
  }
}
