import { Knex } from 'knex';

export const name = 'm20250430115720_initial';

export const up = async (knex: Knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamps(true, true);
  });
};

export const down = async (knex: Knex) => {
  await knex.schema.dropTable('users');
};
