import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'knex/types/tables';
import { Knex } from 'knex';
import { InjectKnex } from '../../knex/knex.constant';

export type CreateUser = Pick<User, 'username'> & { password: string };

@Injectable()
export class UserRepository {
  static readonly SALT_ROUNDS = 12;

  constructor(@InjectKnex() private readonly knex: Knex) {}

  async clear() {
    await this.knex('users_composite').delete().from('users');
  }

  async create(_data: CreateUser): Promise<User> {
    const { password, ...data } = _data;
    const passwordHash = await bcrypt.hash(password, UserRepository.SALT_ROUNDS);
    return this.knex.transaction(async (tx) => {
      const [userId] = await tx('users_composite')
        .insert({ ...data, password_hash: passwordHash })
        .into('users');
      const user = await tx('users').where('id', userId).first();
      return user!;
    });
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return this.knex('users').where('username', username).first();
  }
}
