import type { Express, Request, Response, NextFunction } from 'express';
import type { UserController } from '../controllers/UserController';

/**
 * Registers user routes on the app. POST /users is without auth for now.
 */
export function registerUserRoutes(app: Express, controller: UserController): void {
  app.get('/users', (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });

  app.post('/users', (req: Request, res: Response, next: NextFunction) => {
    controller.create(req, res, next).catch(next);
  });

  app.put('/users/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.update(req, res, next).catch(next);
  });

  app.delete('/users/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.delete(req, res, next).catch(next);
  });
}
