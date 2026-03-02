import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../config/jwt';
import { error } from '../views';

const BEARER_PREFIX = 'Bearer ';

/**
 * Auth middleware: extracts Authorization Bearer token, verifies signature and exp,
 * attaches decoded payload to req.user. Responds 401 and does not call next() if missing or invalid.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    error(res, 'Missing or invalid Authorization header', 'UNAUTHORIZED');
    return;
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    error(res, 'Missing or invalid Authorization header', 'UNAUTHORIZED');
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    error(res, 'Invalid or expired token', 'UNAUTHORIZED');
  }
}
