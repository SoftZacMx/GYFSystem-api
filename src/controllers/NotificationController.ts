import type { Request, Response, NextFunction } from 'express';
import type { NotificationService } from '../services/NotificationService';
import { createAppError } from '../middlewares/global-error-handler';
import { success, successList, listMeta } from '../views';
import { createNotificationBodySchema, notificationQuerySchema } from '../validators/notification';

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = createNotificationBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const data = await this.notificationService.create(parsed.data);
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = notificationQuerySchema.safeParse(req.query);
    if (!parsed.success) { next(parsed.error); return; }
    const { page, limit, sortBy, order, userId, isRead, type } = parsed.data;
    try {
      const { data, total } = await this.notificationService.findAll({ page, limit, sortBy, order, userId, isRead, type });
      successList(res, data, listMeta(page, limit, total));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const data = await this.notificationService.findById(id);
      success(res, data);
    } catch (err) { next(err); }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const data = await this.notificationService.markAsRead(id);
      success(res, data);
    } catch (err) { next(err); }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    if (!userId) { next(createAppError('Authentication required', 'UNAUTHORIZED')); return; }
    try {
      const data = await this.notificationService.markAllAsReadByUser(userId);
      success(res, data);
    } catch (err) { next(err); }
  }

  async myNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    if (!userId) { next(createAppError('Authentication required', 'UNAUTHORIZED')); return; }
    const parsed = notificationQuerySchema.safeParse(req.query);
    if (!parsed.success) { next(parsed.error); return; }
    const { page, limit, sortBy, order, isRead, type } = parsed.data;
    try {
      const { data, total } = await this.notificationService.findAll({ page, limit, sortBy, order, userId, isRead, type });
      successList(res, data, listMeta(page, limit, total));
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      await this.notificationService.delete(id);
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
