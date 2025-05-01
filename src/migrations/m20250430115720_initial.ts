import { Knex } from 'knex';

export const name = '20250430115720_initial';

export function up(knex: Knex) {
  return knex.transaction(async (tx) => {
    await tx.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('username').notNullable();
      t.string('password_hash').notNullable();
      t.timestamps(true, true);
    });

    await tx.schema.createTable('categories', (t) => {
      t.increments('id').primary();
      t.integer('user_id').notNullable();
      t.string('name').notNullable();
      t.timestamps(true, true);

      t.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.unique(['user_id', 'name']);
    });
  });
}
export function down(knex: Knex) {
  return knex.transaction(async (tx) => {
    await tx.schema.dropTable('categories');
    await tx.schema.dropTable('users');
  });
}
