declare module 'knex/types/tables' {
  interface User {
    id: number;
    username: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
  }

  interface Category {
    id: number;
    user_id: number;
    name: string;
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
    categories: Category;
    categories_composite: Knex.CompositeTableType<
      Category,
      Pick<Category, 'user_id' | 'name'> & Partial<Pick<Category, 'created_at' | 'updated_at'>>,
      Partial<Omit<Category, 'id'>>
    >;
  }
}
