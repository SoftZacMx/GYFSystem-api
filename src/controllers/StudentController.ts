import type { Request, Response, NextFunction } from 'express';
import type { StudentService } from '../services/StudentService';
import type { ParentStudentService } from '../services/ParentStudentService';
import type { StudentDto } from '../services/StudentService';
import { createAppError } from '../middlewares/global-error-handler';
import { success, successList, listMeta } from '../views';
import { createStudentBodySchema, updateStudentBodySchema, studentQuerySchema } from '../validators/student';

export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly parentStudentService?: ParentStudentService,
  ) {}

  async listMyStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.sub != null ? Number(req.user.sub) : NaN;
    if (Number.isNaN(userId) || userId < 1) {
      next(createAppError('Unauthorized', 'UNAUTHORIZED'));
      return;
    }
    if (!this.parentStudentService) {
      next(createAppError('Not available', 'INTERNAL_ERROR'));
      return;
    }
    try {
      const list = await this.parentStudentService.findStudentsByUserId(userId);
      const ids = list.map((s) => s.studentId);
      const dtos = await this.studentService.findByIds(ids);
      const byId = new Map(dtos.map((d) => [d.id, d]));
      const data = ids.map((id) => byId.get(id)).filter((d): d is StudentDto => d != null);
      success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = createStudentBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.studentService.create(parsed.data, req.user?.sub, ip ?? undefined);
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = studentQuerySchema.safeParse(req.query);
    if (!parsed.success) { next(parsed.error); return; }
    const { page, limit, sortBy, order } = parsed.data;
    try {
      const { data, total } = await this.studentService.findAll({ page, limit, sortBy, order });
      successList(res, data, listMeta(page, limit, total));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const data = await this.studentService.findById(id);
      success(res, data, undefined, 200);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    const parsed = updateStudentBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.studentService.update(id, parsed.data, req.user?.sub, ip ?? undefined);
      success(res, data, undefined, 200);
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      await this.studentService.delete(id, req.user?.sub, ip ?? undefined);
      success(res, null, undefined, 200);
    } catch (err) { next(err); }
  }
}
