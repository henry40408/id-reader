import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { User } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';

export type CreateUser = Knex.DbRecordArr<User> & { password: string };

@Injectable()
export class UserRepository {
  static SALT_ROUNDS = 10;

  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async clear() {
    await this.knex<User>('users').delete();
  }

  async create(dto: CreateUser): Promise<User> {
    const { password, ...rest } = dto;
    const data: Knex.DbRecordArr<User> = {
      ...rest,
      password_hash: await bcrypt.hash(password, UserRepository.SALT_ROUNDS),
    };
    const [id] = await this.knex<User>('users').insert(data);
    const user = await this.knex<User>('users').where('id', id).first();
    return user!;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    return await this.knex<User>('users').where({ username }).first();
  }
}
