import type { Express, Request, Response, NextFunction } from 'express';
import type { DocumentController } from '../controllers/DocumentController';
import { authMiddleware } from '../middlewares/auth';
import { uploadSingle } from '../middlewares/upload';

export function registerDocumentRoutes(app: Express, controller: DocumentController): void {
  app.get('/documents', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/documents/:id/verify', (req: Request, res: Response, next: NextFunction) => {
    controller.verifySignature(req, res, next).catch(next);
  });

  app.get('/documents/:id/qr', (req: Request, res: Response, next: NextFunction) => {
    controller.qrCode(req, res, next).catch(next);
  });

  app.get('/documents/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });

  app.get('/documents/:id/download', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.download(req, res, next).catch(next);
  });

  app.post('/documents', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.create(req, res, next).catch(next);
  });

  app.post('/documents/upload', authMiddleware, uploadSingle, (req: Request, res: Response, next: NextFunction) => {
    controller.upload(req, res, next).catch(next);
  });

  app.delete('/documents/:id', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.delete(req, res, next).catch(next);
  });
}
