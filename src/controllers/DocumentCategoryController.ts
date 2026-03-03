import type { Request, Response, NextFunction } from 'express';
import type { DocumentCategoryService } from '../services/DocumentCategoryService';
import { createAppError } from '../middlewares/global-error-handler';
import { success } from '../views';
import { createDocumentCategoryBodySchema, updateDocumentCategoryBodySchema } from '../validators/document-category';

export class DocumentCategoryController {
  constructor(private readonly categoryService: DocumentCategoryService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = createDocumentCategoryBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const data = await this.categoryService.create(parsed.data);
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.categoryService.findAll();
      success(res, data);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const data = await this.categoryService.findById(id);
      success(res, data);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    const parsed = updateDocumentCategoryBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }
    try {
      const data = await this.categoryService.update(id, parsed.data);
      success(res, data);
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      await this.categoryService.delete(id);
      success(res, null, undefined, 200);
    } catch (err) { next(err); }
  }
}
