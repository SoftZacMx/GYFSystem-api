import type { Request, Response, NextFunction } from 'express';
import type { ParentStudentService } from '../services/ParentStudentService';
import { createAppError } from '../middlewares/global-error-handler';
import { success } from '../views';
import { parentStudentBodySchema } from '../validators/parent-student';

export class ParentStudentController {
  constructor(private readonly parentStudentService: ParentStudentService) {}

  async associate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = parentStudentBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const data = await this.parentStudentService.associate(parsed.data.userId, parsed.data.studentId);
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async disassociate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = parentStudentBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      await this.parentStudentService.disassociate(parsed.data.userId, parsed.data.studentId);
      res.status(204).send();
    } catch (err) { next(err); }
  }

  async studentsByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId) || userId < 1) { next(createAppError('Invalid userId', 'BAD_REQUEST')); return; }
    try {
      const data = await this.parentStudentService.findStudentsByUserId(userId);
      success(res, data);
    } catch (err) { next(err); }
  }

  async parentsByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    const studentId = Number(req.params.studentId);
    if (Number.isNaN(studentId) || studentId < 1) { next(createAppError('Invalid studentId', 'BAD_REQUEST')); return; }
    try {
      const data = await this.parentStudentService.findParentsByStudentId(studentId);
      success(res, data);
    } catch (err) { next(err); }
  }
}
