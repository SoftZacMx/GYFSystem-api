import type { Request, Response, NextFunction } from 'express';
import type { UserService } from '../services/UserService';
import { createAppError } from '../middlewares/global-error-handler';
import { success } from '../views';
import { createUserBodySchema, updateUserBodySchema } from '../validators/user';

export class UserController {
  constructor(private readonly userService: UserService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = createUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.userService.create(parsed.data, req.user?.sub, ip ?? undefined);
      success(res, data, undefined, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const skip = req.query.skip != null ? Number(req.query.skip) : undefined;
      const take = req.query.take != null ? Number(req.query.take) : undefined;
      const data = await this.userService.findAll(
        [skip, take].every(Number.isInteger) ? { skip, take } : undefined
      );
      success(res, data, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      next(createAppError('Invalid id', 'BAD_REQUEST'));
      return;
    }
    try {
      const data = await this.userService.findById(id);
      success(res, data, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      next(createAppError('Invalid id', 'BAD_REQUEST'));
      return;
    }
    const parsed = updateUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.userService.update(id, parsed.data, req.user?.sub, ip ?? undefined);
      success(res, data, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) {
      next(createAppError('Invalid id', 'BAD_REQUEST'));
      return;
    }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      await this.userService.delete(id, req.user?.sub, ip ?? undefined);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
