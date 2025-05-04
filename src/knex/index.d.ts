import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
  }

  interface Tables {
    users: User;
    users_composite: Knex.CompositeTableType<
      User,
      Pick<User, 'username' | 'password_hash'> & Partial<Pick<User, 'created_at' | 'updated_at'>>,
      Partial<Omit<User, 'id'>>
    >;
  }
}
