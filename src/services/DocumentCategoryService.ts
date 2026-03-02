import type { IDocumentCategoryRepository } from '../repositories/interfaces/IDocumentCategoryRepository';
import type { CreateDocumentCategoryBody, UpdateDocumentCategoryBody } from '../validators/document-category';
import { createAppError } from '../middlewares/global-error-handler';

export interface DocumentCategoryDto {
  id: number;
  name: string;
  description: string | null;
}

function toDto(c: { id: number; name: string; description: string | null }): DocumentCategoryDto {
  return { id: c.id, name: c.name, description: c.description };
}

export class DocumentCategoryService {
  constructor(private readonly categoryRepository: IDocumentCategoryRepository) {}

  async create(body: CreateDocumentCategoryBody): Promise<DocumentCategoryDto> {
    const existing = await this.categoryRepository.findByName(body.name);
    if (existing) {
      throw createAppError('Category name already exists', 'CONFLICT');
    }
    const category = await this.categoryRepository.save({
      name: body.name,
      description: body.description ?? null,
    });
    return toDto(category);
  }

  async findAll(): Promise<DocumentCategoryDto[]> {
    const list = await this.categoryRepository.findAll();
    return list.map(toDto);
  }

  async findById(id: number): Promise<DocumentCategoryDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw createAppError('Document category not found', 'NOT_FOUND');
    }
    return toDto(category);
  }

  async update(id: number, body: UpdateDocumentCategoryBody): Promise<DocumentCategoryDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw createAppError('Document category not found', 'NOT_FOUND');
    }
    if (body.name !== undefined && body.name !== category.name) {
      const existing = await this.categoryRepository.findByName(body.name);
      if (existing) {
        throw createAppError('Category name already exists', 'CONFLICT');
      }
    }
    const updated = await this.categoryRepository.save({ id, ...body });
    return toDto(updated);
  }

  async delete(id: number): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw createAppError('Document category not found', 'NOT_FOUND');
    }
    await this.categoryRepository.delete(id);
  }
}
