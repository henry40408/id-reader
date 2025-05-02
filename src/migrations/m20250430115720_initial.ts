import { Knex } from 'knex';

export const name = '20250430115720_initial';

export function up(knex: Knex) {
  return knex.transaction(async (tx) => {
    await tx.schema.createTable('users', (t) => {
      t.increments('id').primary();
      t.string('username').notNullable();
      t.string('password_hash').notNullable();
      t.timestamps(true, true);

      t.unique('username');
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
      t.string('xml_url').notNullable();

      t.string('description').nullable();
      t.string('html_url').nullable();
      t.integer('image_id').nullable().references('id').inTable('images').onDelete('SET NULL');

      t.timestamps(true, true);

      t.unique(['category_id', 'xml_url']);
    });

    await tx.schema.createTable('images', (t) => {
      t.increments('id').primary();
      t.string('url').notNullable();
      t.binary('blob').notNullable();
      t.timestamps(true, true);

      t.unique('url');
    });
  });
}
export function down(knex: Knex) {
  return knex.transaction(async (tx) => {
    await tx.schema.dropTable('images');
    await tx.schema.dropTable('feeds');
    await tx.schema.dropTable('categories');
    await tx.schema.dropTable('users');
  });
}
