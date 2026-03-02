import type { Request, Response, NextFunction } from 'express';
import type { UserTypeService } from '../services/UserTypeService';
import { createAppError } from '../middlewares/global-error-handler';
import { success } from '../views';

export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.userTypeService.findAll();
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
      const data = await this.userTypeService.findById(id);
      success(res, data, undefined, 200);
    } catch (err) {
      next(err);
    }
  }
}
