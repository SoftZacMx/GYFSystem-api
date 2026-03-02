import type { Express, Request, Response, NextFunction } from 'express';
import type { DocumentCategoryController } from '../controllers/DocumentCategoryController';

export function registerDocumentCategoryRoutes(app: Express, controller: DocumentCategoryController): void {
  app.get('/document-categories', (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/document-categories/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });

  app.post('/document-categories', (req: Request, res: Response, next: NextFunction) => {
    controller.create(req, res, next).catch(next);
  });

  app.put('/document-categories/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.update(req, res, next).catch(next);
  });

  app.delete('/document-categories/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.delete(req, res, next).catch(next);
  });
}
