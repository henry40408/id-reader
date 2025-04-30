import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Knex } from 'knex';
import { Tables } from 'knex/types/tables';
import { BaseRepository } from '../knex/base-repository';
import { KNEX } from '../knex/knex.constant';

export type CreateUser = Omit<Tables['users_composite']['insert'], 'password_hash'> & { password: string };

@Injectable()
export class UserRepository extends BaseRepository<'users', 'users_composite'> {
  constructor(@Inject(KNEX) knex: Knex) {
    super(knex, 'users', 'users_composite');
  }

  async createUser(dto: CreateUser): Promise<Tables['users']> {
    const { password, ...rest } = dto;
    const data: Tables['users_composite']['insert'] = {
      ...rest,
      password_hash: await bcrypt.hash(password, 10),
    };
    return this.create(data);
  }
}
