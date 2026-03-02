import type { Express, Request, Response, NextFunction } from 'express';
import type { ParentStudentController } from '../controllers/ParentStudentController';

export function registerParentStudentRoutes(app: Express, controller: ParentStudentController): void {
  app.post('/parent-students', (req: Request, res: Response, next: NextFunction) => {
    controller.associate(req, res, next).catch(next);
  });

  app.delete('/parent-students', (req: Request, res: Response, next: NextFunction) => {
    controller.disassociate(req, res, next).catch(next);
  });

  app.get('/users/:userId/students', (req: Request, res: Response, next: NextFunction) => {
    controller.studentsByUser(req, res, next).catch(next);
  });

  app.get('/students/:studentId/parents', (req: Request, res: Response, next: NextFunction) => {
    controller.parentsByStudent(req, res, next).catch(next);
  });
}
