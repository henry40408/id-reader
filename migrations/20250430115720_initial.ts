import { Knex } from 'knex';

export function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable();
    table.string('password_hash').notNullable();
    table.timestamps(true, true);
  });
}

export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
