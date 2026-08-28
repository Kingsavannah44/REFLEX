import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the role enum type
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('retailer_staff', 'dispatcher', 'rider');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name', 100).notNullable();
    table.string('phone', 20).notNullable().unique();
    table.string('email', 150).nullable().unique();
    table.string('password_hash', 255).notNullable();
    table
      .specificType('role', 'user_role')
      .notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamps(true, true); // created_at, updated_at
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_role;');
}
