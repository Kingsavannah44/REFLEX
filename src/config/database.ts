import knex from 'knex';
import { env } from './env';

const db = knex({
  client: 'pg',
  connection: {
    connectionString: env.databaseUrl,
    ssl: { rejectUnauthorized: false },
  },
  pool: { min: 2, max: 10 },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
});

export default db;
