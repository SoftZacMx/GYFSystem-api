import type { Express, Request, Response, NextFunction } from 'express';
import type { CompanyController } from '../controllers/CompanyController';
import { authMiddleware } from '../middlewares/auth';
import { validateBody, validateQuery } from '../middlewares/validate';
import {
  companyIdQuerySchema,
  createCompanyBodySchema,
  updateCompanyBodySchema,
} from '../validators/company';

export function registerCompanyRoutes(app: Express, controller: CompanyController): void {
  app.get(
    '/company',
    authMiddleware,
    validateQuery(companyIdQuerySchema),
    (req: Request, res: Response, next: NextFunction) => controller.get(req, res, next).catch(next)
  );

  app.put(
    '/company',
    authMiddleware,
    validateQuery(companyIdQuerySchema),
    validateBody(updateCompanyBodySchema),
    (req: Request, res: Response, next: NextFunction) => controller.update(req, res, next).catch(next)
  );

  app.post(
    '/company',
    authMiddleware,
    validateBody(createCompanyBodySchema),
    (req: Request, res: Response, next: NextFunction) => controller.create(req, res, next).catch(next)
  );
}
