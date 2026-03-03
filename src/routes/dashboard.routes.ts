import type { Express, Request, Response, NextFunction } from 'express';
import type { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middlewares/auth';

export function registerDashboardRoutes(app: Express, controller: DashboardController): void {
  app.get(
    '/dashboard',
    authMiddleware,
    (req: Request, res: Response, next: NextFunction) => controller.get(req, res, next).catch(next)
  );
}
