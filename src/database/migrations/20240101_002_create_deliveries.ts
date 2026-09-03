import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create delivery status enum
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE delivery_status AS ENUM (
        'OPEN', 'ASSIGNED', 'PICKED_UP', 'DELIVERED', 'CANCELLED'
      );
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await knex.schema.createTable('deliveries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Who created this delivery (retailer_staff)
    table
      .uuid('created_by')
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    // Which rider is assigned (null = unassigned)
    table
      .uuid('assigned_rider_id')
      .nullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    // Customer details
    table.string('customer_name', 100).notNullable();
    table.string('customer_phone', 20).notNullable();
    table.text('delivery_address').notNullable();
    table.text('item_description').notNullable();

    // Status with default OPEN
    table
      .specificType('status', 'delivery_status')
      .notNullable()
      .defaultTo('OPEN');

    // HMAC-signed token for QR code confirmation
    table.string('qr_token', 255).notNullable().unique();

    // Timestamps for each key milestone
    table.timestamp('assigned_at').nullable();
    table.timestamp('picked_up_at').nullable();
    table.timestamp('delivered_at').nullable();

    table.timestamps(true, true); // created_at, updated_at
  });

  // Partial index for fast open delivery queries
  await knex.raw(`
    CREATE INDEX idx_deliveries_open 
    ON deliveries(status) 
    WHERE status = 'OPEN';
  `);

  // Index for rider's assigned deliveries
  await knex.raw(`
    CREATE INDEX idx_deliveries_rider 
    ON deliveries(assigned_rider_id) 
    WHERE assigned_rider_id IS NOT NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('deliveries');
  await knex.raw('DROP TYPE IF EXISTS delivery_status;');
}
