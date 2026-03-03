import type { Express, Request, Response, NextFunction } from 'express';
import type { StudentController } from '../controllers/StudentController';
import { authMiddleware } from '../middlewares/auth';

export function registerStudentRoutes(app: Express, controller: StudentController): void {
  app.get('/students/me', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
    controller.listMyStudents(req, res, next).catch(next);
  });

  app.get('/students', (req: Request, res: Response, next: NextFunction) => {
    controller.list(req, res, next).catch(next);
  });

  app.get('/students/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.getById(req, res, next).catch(next);
  });

  app.post('/students', (req: Request, res: Response, next: NextFunction) => {
    controller.create(req, res, next).catch(next);
  });

  app.put('/students/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.update(req, res, next).catch(next);
  });

  app.delete('/students/:id', (req: Request, res: Response, next: NextFunction) => {
    controller.delete(req, res, next).catch(next);
  });
}
