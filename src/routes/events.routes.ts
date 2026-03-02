import type { Express, Request, Response, NextFunction } from 'express';
import type { EventController } from '../controllers/EventController';
import { authMiddleware } from '../middlewares/auth';

export function registerEventRoutes(app: Express, controller: EventController): void {
  app.get('/events', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/events/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });

  app.post('/events', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.create(req, res, next).catch(next);
  });

  app.put('/events/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.update(req, res, next).catch(next);
  });

  app.delete('/events/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.delete(req, res, next).catch(next);
  });
}
