import { Knex } from 'knex';

export const name = 'm20250430115720_initial';

export const up = async (knex: Knex) => {
  return knex.transaction(async (tx) => {
    await tx.schema.createTable('images', (t) => {
      t.increments('id').primary();
      t.string('url').notNullable().unique();
      t.binary('blob').notNullable();
      t.string('content_type').notNullable();
      t.timestamps(true, true);
    });

    await tx.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('username').notNullable().unique();
      t.string('password_hash').notNullable();
      t.timestamps(true, true);
    });

    await tx.schema.createTable('categories', (t) => {
      t.increments('id').primary();
      t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.string('name').notNullable();
      t.timestamps(true, true);
      t.unique(['user_id', 'name']);
    });

    await tx.schema.createTable('feeds', (t) => {
      t.increments('id').primary();
      t.integer('category_id').notNullable().references('id').inTable('categories').onDelete('CASCADE');
      t.string('title').notNullable();
      t.string('description');
      t.string('xml_url').notNullable();
      t.string('html_url');
      t.timestamps(true, true);
      t.unique(['category_id', 'xml_url']);
    });
  });
};

export const down = async (knex: Knex) => {
  return knex.transaction(async (tx) => {
    await tx.schema.dropTable('feeds');
    await tx.schema.dropTable('categories');
    await tx.schema.dropTable('users');
    await tx.schema.dropTable('images');
  });
};
