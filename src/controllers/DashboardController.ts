import type { Request, Response, NextFunction } from 'express';
import type { DashboardService } from '../services/DashboardService';
import { success } from '../views';

export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.dashboardService.getDashboard();
      success(res, data);
    } catch (err) {
      next(err);
    }
  }
}
