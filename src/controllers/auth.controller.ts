import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';

type ServiceError = Error & { statusCode: number };

function isServiceError(err: unknown): err is ServiceError {
  return err instanceof Error && 'statusCode' in err;
}

export const AuthController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result);
    } catch (err) {
      if (isServiceError(err)) return sendError(res, err.message, err.statusCode);
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.refresh(req.body);
      sendSuccess(res, result);
    } catch (err) {
      if (isServiceError(err)) return sendError(res, err.message, err.statusCode);
      next(err);
    }
  },
};
