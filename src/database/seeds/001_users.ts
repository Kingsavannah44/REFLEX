import type { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  await knex('delivery_status_history').del();
  await knex('deliveries').del();
  await knex('users').del();

  const password = await bcrypt.hash('Password123!', 12);

  await knex('users').insert([
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Alice Wanjiru',
      phone: '+254711000001',
      email: 'alice@reflexdemo.com',
      password_hash: password,
      role: 'retailer_staff',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Brian Ochieng',
      phone: '+254711000002',
      email: 'brian@reflexdemo.com',
      password_hash: password,
      role: 'dispatcher',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Carol Muthoni',
      phone: '+254711000003',
      email: 'carol@reflexdemo.com',
      password_hash: password,
      role: 'rider',
      is_active: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'David Kamau',
      phone: '+254711000004',
      email: 'david@reflexdemo.com',
      password_hash: password,
      role: 'rider',
      is_active: true,
    },
  ]);
}
