import type { Knex } from 'knex';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const sslConfig = { rejectUnauthorized: false };

const migrationsDir = path.resolve(__dirname, '../database/migrations');
const seedsDir = path.resolve(__dirname, '../database/seeds');

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      connectionString: process.env['DATABASE_URL'],
      ssl: sslConfig,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: migrationsDir,
      extension: 'ts',
    },
    seeds: {
      directory: seedsDir,
      extension: 'ts',
    },
  },
  production: {
    client: 'pg',
    connection: {
      connectionString: process.env['DATABASE_URL'],
      ssl: sslConfig,
    },
    pool: { min: 2, max: 10 },
    migrations: {
      tableName: 'knex_migrations',
      directory: migrationsDir,
      extension: 'ts',
    },
  },
};

export default config;
