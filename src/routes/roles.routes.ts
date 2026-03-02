import type { Express, Request, Response, NextFunction } from 'express';
import type { RoleController } from '../controllers/RoleController';

export function registerRoleRoutes(app: Express, controller: RoleController): void {
  app.get('/roles', (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/roles/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });
}
