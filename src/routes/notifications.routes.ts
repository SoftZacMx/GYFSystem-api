import type { Express, Request, Response, NextFunction } from 'express';
import type { NotificationController } from '../controllers/NotificationController';
import { authMiddleware } from '../middlewares/auth';

export function registerNotificationRoutes(app: Express, controller: NotificationController): void {
  app.get('/notifications/me', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.myNotifications(req, res, next).catch(next);
  });

  app.patch('/notifications/me/read-all', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.markAllAsRead(req, res, next).catch(next);
  });

  app.get('/notifications', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/notifications/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });

  app.post('/notifications', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.create(req, res, next).catch(next);
  });

  app.patch('/notifications/:id/read', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.markAsRead(req, res, next).catch(next);
  });

  app.delete('/notifications/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.delete(req, res, next).catch(next);
  });
}
