import type { Express, Request, Response, NextFunction } from 'express';
import type { UserTypeController } from '../controllers/UserTypeController';

export function registerUserTypeRoutes(app: Express, controller: UserTypeController): void {
  app.get('/user-types', (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/user-types/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });
}
