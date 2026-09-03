import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../types';
import { sendError } from '../utils/response';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, `Access denied. This action requires: ${allowedRoles.join(' or ')}.`, 403);
      return;
    }

    next();
  };
}
