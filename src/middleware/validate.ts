import type { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { sendError } from '../utils/response';

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).errors.map(
        (e: { path: (string | number)[]; message: string }) => ({
          field: e.path.join('.'),
          message: e.message,
        }),
      );
      sendError(res, 'Validation failed.', 422, errors);
      return;
    }

    req.body = result.data;
    next();
  };
}
