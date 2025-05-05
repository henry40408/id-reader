import { Knex } from 'knex';

export const name = 'm20250430115720_initial';

export const up = async (knex: Knex) => {
  return knex.transaction(async (tx) => {
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
  });
};

export const down = async (knex: Knex) => {
  return knex.transaction(async (tx) => {
    await tx.schema.dropTable('categories');
    await tx.schema.dropTable('users');
  });
};
