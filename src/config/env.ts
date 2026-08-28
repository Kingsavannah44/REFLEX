import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env variable: ${key}`);
  return value;
}

export const env = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  qrHmacSecret: requireEnv('QR_HMAC_SECRET'),
};
