import type { Request, Response, NextFunction } from 'express';
import { error } from '../views';

/**
 * Returns a middleware that allows only requests whose user has one of the given roleIds.
 * Must be used after authMiddleware so req.user is set.
 * Responds 403 FORBIDDEN and does not call next() if user is missing or roleId is not in the list.
 */
export function requireRoles(...allowedRoleIds: number[]) {
  const set = new Set(allowedRoleIds);

  return function roleMiddleware(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      error(res, 'Forbidden', 'FORBIDDEN');
      return;
    }
    if (!set.has(req.user.roleId)) {
      error(res, 'Forbidden', 'FORBIDDEN');
      return;
    }
    next();
  };
}
