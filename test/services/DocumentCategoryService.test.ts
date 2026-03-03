import { describe, it, expect, vi } from 'vitest';
import { DocumentCategoryService } from '@/services/DocumentCategoryService';
import type { IDocumentCategoryRepository } from '@/repositories/interfaces/IDocumentCategoryRepository';

function category(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'ID',
    description: 'Identity document',
    ...overrides,
  };
}

describe('DocumentCategoryService', () => {
  it('create: saves and returns dto', async () => {
    const repo: IDocumentCategoryRepository = {
      findByName: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(category({ id: 1, name: 'New', description: 'Desc' })),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    const result = await service.create({ name: 'New', description: 'Desc' });
    expect(result).toMatchObject({ id: 1, name: 'New', description: 'Desc' });
  });

  it('create: throws CONFLICT when name exists', async () => {
    const repo: IDocumentCategoryRepository = {
      findByName: vi.fn().mockResolvedValue(category()),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    await expect(service.create({ name: 'ID', description: null })).rejects.toMatchObject({
      message: 'Category name already exists',
      code: 'CONFLICT',
    });
  });

  it('findById: returns category when found', async () => {
    const repo: IDocumentCategoryRepository = {
      findById: vi.fn().mockResolvedValue(category()),
      findByName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    const result = await service.findById(1);
    expect(result).toMatchObject({ id: 1, name: 'ID' });
  });

  it('findById: throws NOT_FOUND when missing', async () => {
    const repo: IDocumentCategoryRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'Document category not found',
      code: 'NOT_FOUND',
    });
  });

  it('findAll: returns list', async () => {
    const repo: IDocumentCategoryRepository = {
      findAll: vi.fn().mockResolvedValue([category()]),
      findById: vi.fn(),
      findByName: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, name: 'ID' });
  });

  it('update: throws NOT_FOUND when category missing', async () => {
    const repo: IDocumentCategoryRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    await expect(service.update(999, { name: 'X' })).rejects.toMatchObject({
      message: 'Document category not found',
      code: 'NOT_FOUND',
    });
  });

  it('delete: throws NOT_FOUND when missing', async () => {
    const repo: IDocumentCategoryRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByName: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      delete: vi.fn(),
    };
    const service = new DocumentCategoryService(repo);
    await expect(service.delete(999)).rejects.toMatchObject({
      message: 'Document category not found',
      code: 'NOT_FOUND',
    });
  });
});
