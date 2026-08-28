import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    sendError(res, 'Token missing.', 401);
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err: unknown) {
    const expired = err instanceof Error && err.name === 'TokenExpiredError';
    sendError(res, expired ? 'Token expired. Please log in again.' : 'Invalid token.', 401);
  }
}
