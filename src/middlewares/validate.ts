import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';

/**
 * Middleware that parses and validates req.body with the given Zod schema.
 * On success: assigns parsed data to req.body and calls next().
 * On failure: calls next(zodError); global error handler returns 400 with controlled message.
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}

/**
 * Middleware that parses and validates req.query with the given Zod schema.
 * On success: assigns parsed data to req.validatedQuery and calls next().
 * On failure: calls next(zodError); global error handler returns 400 with controlled message.
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.validatedQuery = result.data as z.infer<T>;
    next();
  };
}
