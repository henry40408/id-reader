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

  interface Feed {
    id: number;
    category_id: number;
    title: string;
    description?: string;
    xml_url: string;
    html_url?: string;
    created_at: string;
    updated_at: string;
  }

  interface Image {
    id: number;
    url: string;
    blob: ArrayBuffer;
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
    feeds: Feed;
    feeds_composite: Knex.CompositeTableType<
      Feed,
      Pick<Feed, 'category_id' | 'title' | 'xml_url'> &
        Partial<Pick<Feed, 'description' | 'html_url' | 'created_at' | 'updated_at'>>,
      Partial<Omit<Feed, 'id'>>
    >;
    images: Image;
    images_composite: Knex.CompositeTableType<
      Image,
      Pick<Image, 'url'> & Partial<Pick<Image, 'created_at' | 'updated_at'>>,
      Partial<Omit<Image, 'id'>>
    >;
  }
}
