import type { Request, Response, NextFunction } from 'express';
import type { EventService } from '../services/EventService';
import { createAppError } from '../middlewares/global-error-handler';
import { success, successList, listMeta } from '../views';
import { createEventBodySchema, updateEventBodySchema, eventQuerySchema } from '../validators/event';

export class EventController {
  constructor(private readonly eventService: EventService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const createdBy = req.user?.sub;
    if (!createdBy) { next(createAppError('Authentication required', 'UNAUTHORIZED')); return; }

    const parsed = createEventBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }

    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.eventService.create(parsed.data, createdBy, ip ?? undefined);
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = eventQuerySchema.safeParse(req.query);
    if (!parsed.success) { next(parsed.error); return; }
    const { page, limit, sortBy, order, createdBy } = parsed.data;
    try {
      const { data, total } = await this.eventService.findAll({ page, limit, sortBy, order, createdBy });
      successList(res, data, listMeta(page, limit, total));
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const data = await this.eventService.findById(id);
      success(res, data);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    const parsed = updateEventBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.eventService.update(id, parsed.data, req.user?.sub, ip ?? undefined);
      success(res, data);
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      await this.eventService.delete(id, req.user?.sub, ip ?? undefined);
      res.status(204).send();
    } catch (err) { next(err); }
  }
}
