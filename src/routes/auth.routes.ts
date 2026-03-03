import type { Express, Request, Response, NextFunction } from 'express';
import type { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth';
import { validateQuery } from '../middlewares/validate';
import { verifyAccountQuerySchema } from '../validators';

export function registerAuthRoutes(app: Express, authController: AuthController): void {
  app.post('/auth/login', (req: Request, res: Response, next: NextFunction) => {
    authController.login(req, res, next).catch(next);
  });

  app.get(
    '/auth/account/verify',
    validateQuery(verifyAccountQuerySchema),
    (req: Request, res: Response, next: NextFunction) => {
      authController.verifyAccount(req, res, next).catch(next);
    }
  );

  app.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
    authController.me(req, res);
  });
}
