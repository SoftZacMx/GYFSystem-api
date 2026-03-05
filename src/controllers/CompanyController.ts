import type { Request, Response, NextFunction } from 'express';
import type { CompanyService } from '../services/CompanyService';
import { success } from '../views';
import type { CompanyIdQuery, CreateCompanyBody, UpdateCompanyBody } from '../validators/company';

export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  /** Public: theme config for app bootstrap (no auth). */
  async getTheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.companyService.getThemeConfig();
      success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.validatedQuery as CompanyIdQuery;
    try {
      const data = await this.companyService.get(id);
      success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.validatedQuery as CompanyIdQuery;
    const body = req.body as UpdateCompanyBody;
    try {
      const data = await this.companyService.update(id, body);
      success(res, data);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const body = req.body as CreateCompanyBody;
    try {
      const data = await this.companyService.create(body);
      success(res, data);
    } catch (err) {
      next(err);
    }
  }
}
