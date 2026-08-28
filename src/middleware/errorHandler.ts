import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// Must be registered last in app.ts — Express identifies error handlers by arity (4 params)
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err.message);

  if (env.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(500).json({
    success: false,
    error: {
      message: 'Something went wrong.',
      ...(env.nodeEnv === 'development' ? { detail: err.message } : {}),
    },
  });
}
