import type { Response } from 'express';
import type { SuccessMeta, ListMeta, ErrorCode } from './types';

const ERROR_CODE_TO_HTTP: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

function defaultMeta(): SuccessMeta {
  return { timestamp: new Date().toISOString() };
}

/**
 * Send a successful response for a single resource (200 or 201).
 * Meta always includes at least timestamp.
 */
export function success<T>(res: Response, data: T, meta?: Partial<SuccessMeta>, statusCode = 200): void {
  const finalMeta = { ...defaultMeta(), ...meta };
  res.status(statusCode).json({ success: true, data, meta: finalMeta });
}

/**
 * Send a successful response for a list with pagination (200).
 * Meta must include timestamp and page, limit, total, totalPages.
 */
export function successList<T>(res: Response, data: T[], meta: ListMeta): void {
  res.status(200).json({ success: true, data, meta });
}

/**
 * Build meta for a paginated list. Call with page, limit, total; totalPages is computed.
 */
export function listMeta(page: number, limit: number, total: number): ListMeta {
  return {
    timestamp: new Date().toISOString(),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 0,
  };
}

/**
 * Send an error response (4xx/5xx) with standard shape.
 * HTTP status is derived from code; use errorWithStatus to override.
 */
export function error(res: Response, message: string, code: ErrorCode, details?: unknown): void {
  const statusCode = ERROR_CODE_TO_HTTP[code];
  res.status(statusCode).json({
    success: false,
    error: { message, code, ...(details !== undefined && { details }) },
  });
}

/**
 * Send an error response with explicit HTTP status (e.g. when code is not in the standard set).
 */
export function errorWithStatus(
  res: Response,
  statusCode: number,
  message: string,
  code: ErrorCode,
  details?: unknown
): void {
  res.status(statusCode).json({
    success: false,
    error: { message, code, ...(details !== undefined && { details }) },
  });
}
