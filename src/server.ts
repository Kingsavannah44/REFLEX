import app from './app';
import { env } from './config/env';
import db from './config/database';

async function start() {
  try {
    await db.raw('SELECT 1');
    console.log('database connected');
  } catch (err) {
    console.error('database connection failed:', err);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`server running on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    console.log(`${signal} — shutting down`);
    server.close(async () => {
      await db.destroy();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
