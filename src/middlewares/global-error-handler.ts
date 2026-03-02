import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config';
import { error, errorWithStatus } from '../views';
import type { ErrorCode } from '../views';

const ERROR_CODES: ErrorCode[] = [
  'VALIDATION_ERROR',
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'UNPROCESSABLE_ENTITY',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
];

export interface AppErrorPayload {
  message: string;
  code: ErrorCode;
  statusCode?: number;
  details?: unknown;
}

function isErrorCode(code: string): code is ErrorCode {
  return (ERROR_CODES as string[]).includes(code);
}

function isAppErrorPayload(err: unknown): err is AppErrorPayload {
  if (typeof err !== 'object' || err === null || !('message' in err) || !('code' in err)) {
    return false;
  }
  const m = (err as AppErrorPayload).message;
  const c = (err as AppErrorPayload).code;
  return typeof m === 'string' && isErrorCode(c);
}

/**
 * Create an error object to pass to next() or throw. The global error handler will respond with standard JSON.
 */
export function createAppError(
  message: string,
  code: ErrorCode,
  options?: { statusCode?: number; details?: unknown }
): AppErrorPayload {
  return { message, code, ...options };
}

function formatZodDetails(zodError: ZodError): Array<{ path: string; message: string }> {
  return zodError.issues.map((e) => ({
    path: e.path.map(String).join('.'),
    message: e.message,
  }));
}

export function globalErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) {
    return;
  }

  if (err instanceof ZodError) {
    const details = formatZodDetails(err);
    error(res, err.message || 'Validation failed', 'VALIDATION_ERROR', details);
    return;
  }

  if (isAppErrorPayload(err)) {
    if (err.statusCode !== undefined) {
      errorWithStatus(res, err.statusCode, err.message, err.code, err.details);
    } else {
      error(res, err.message, err.code, err.details);
    }
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? 'An unexpected error occurred.' : (err as Error)?.message ?? 'Unknown error';
  logger.error({ err }, 'Unhandled error');
  error(res, message, 'INTERNAL_ERROR');
}
