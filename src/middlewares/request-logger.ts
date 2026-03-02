import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config';

/**
 * Logs each request: method, url, statusCode, and duration.
 * Does not log body or headers to avoid sensitive data.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: duration,
      },
      'request'
    );
  });
  next();
}
