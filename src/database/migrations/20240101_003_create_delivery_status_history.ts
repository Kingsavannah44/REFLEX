import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('delivery_status_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('delivery_id')
      .notNullable()
      .references('id')
      .inTable('deliveries')
      .onDelete('CASCADE');

    table
      .uuid('changed_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.specificType('previous_status', 'delivery_status').notNullable();
    table.specificType('new_status', 'delivery_status').notNullable();
    table.text('notes').nullable();

    // Append-only — only created_at, no updated_at
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Index for quick history lookups per delivery
  await knex.raw(`
    CREATE INDEX idx_status_history_delivery 
    ON delivery_status_history(delivery_id);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('delivery_status_history');
}
