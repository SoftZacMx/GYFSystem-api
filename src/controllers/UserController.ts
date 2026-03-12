import type { Request, Response, NextFunction } from 'express';
import type { UserService } from '../services/UserService';
import type { AuthService } from '../services/AuthService';
import { createAppError } from '../middlewares/global-error-handler';
import { success, successList, listMeta } from '../views';
import { createUserBodySchema, updateUserBodySchema, userListQuerySchema } from '../validators/user';
import { logger } from '../config';

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = createUserBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.userService.create(parsed.data, req.user?.sub, ip ?? undefined);
      if (!parsed.data.activateAccount) {
        try {
          await this.authService.sendVerificationEmail(data.id, data.email, data.name);
        } catch (err) {
          logger.warn({ err, userId: data.id, email: data.email }, 'Failed to send verification email after registration');
        }
      } else {
        try {
          await this.authService.sendAccountActivatedEmailForUser(data.id);
        } catch (err) {
          logger.warn({ err, userId: data.id, email: data.email }, 'Failed to send account activated email after registration');
        }
      }
      success(res, data, undefined, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = userListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    try {
      const { page, limit } = parsed.data;
      const { data, total } = await this.userService.findAllPaginated({ page, limit });
      successList(res, data, listMeta(page, limit, total));
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
      success(res, null, undefined, 200);
    } catch (err) {
      next(err);
    }
  }
}
