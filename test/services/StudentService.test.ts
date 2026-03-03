import { describe, it, expect, vi } from 'vitest';
import { StudentService } from '@/services/StudentService';
import type { IStudentRepository } from '@/repositories/interfaces/IStudentRepository';
import type { IDocumentCategoryRepository } from '@/repositories/interfaces/IDocumentCategoryRepository';
import type { IDocumentRepository } from '@/repositories/interfaces/IDocumentRepository';
import type { AuditService } from '@/services/AuditService';

function student(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    fullName: 'John Doe',
    curp: 'CURP123',
    grade: '1st',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const defaultCategories = [{ id: 1, name: 'Categoria A' }];
const defaultCategoryRepo: IDocumentCategoryRepository = {
  findAll: vi.fn().mockResolvedValue(defaultCategories),
  findById: vi.fn(),
  findByName: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

const defaultDocumentRepo: IDocumentRepository = {
  findCategoryIdsByStudentId: vi.fn().mockResolvedValue([]),
  findStudentCategoryPairs: vi.fn().mockResolvedValue([]),
  findById: vi.fn(),
  findByStudentIdAndCategoryId: vi.fn(),
  findAll: vi.fn(),
  count: vi.fn(),
  save: vi.fn(),
  softDelete: vi.fn(),
};

describe('StudentService', () => {
  const auditService = { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;

  it('create saves and returns dto with files', async () => {
    const repo: IStudentRepository = {
      findByCurp: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(student({ id: 1, fullName: 'New', curp: 'X' })),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    const result = await service.create({
      fullName: 'New',
      curp: 'CURP001',
      grade: '1st',
      status: 'active',
    });
    expect(result).toMatchObject({ id: 1, fullName: 'New', curp: 'X', totalUploadFiles: 0, totalPendingFiles: 1 });
    expect(result.files).toEqual([{ category: 'Categoria A', isUpload: false }]);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entityType: 'student', entityId: 1 })
    );
  });

  it('create throws CONFLICT when CURP exists', async () => {
    const repo: IStudentRepository = {
      findByCurp: vi.fn().mockResolvedValue(student()),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    await expect(
      service.create({ fullName: 'X', curp: 'CURP123', grade: '1st', status: 'active' })
    ).rejects.toMatchObject({ message: 'CURP already registered', code: 'CONFLICT' });
  });

  it('findById returns student when found with files', async () => {
    const repo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue(student()),
      findByCurp: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    const result = await service.findById(1);
    expect(result).toMatchObject({ id: 1, fullName: 'John Doe', curp: 'CURP123', totalUploadFiles: 0, totalPendingFiles: 1 });
    expect(result.files).toEqual([{ category: 'Categoria A', isUpload: false }]);
  });

  it('findById throws NOT_FOUND when missing', async () => {
    const repo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByCurp: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'Student not found',
      code: 'NOT_FOUND',
    });
  });

  it('findAll returns data and total with files', async () => {
    const list = [student()];
    const repo: IStudentRepository = {
      findAll: vi.fn().mockResolvedValue(list),
      count: vi.fn().mockResolvedValue(1),
      findById: vi.fn(),
      findByCurp: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    const result = await service.findAll({ page: 1, limit: 10, order: 'asc' });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.data[0].files).toEqual([{ category: 'Categoria A', isUpload: false }]);
    expect(result.data[0].totalUploadFiles).toBe(0);
    expect(result.data[0].totalPendingFiles).toBe(1);
  });

  it('update throws NOT_FOUND when student missing', async () => {
    const repo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByCurp: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    await expect(service.update(999, { fullName: 'X' })).rejects.toMatchObject({
      message: 'Student not found',
      code: 'NOT_FOUND',
    });
  });

  it('delete deletes and audits', async () => {
    const repo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue(student()),
      delete: vi.fn().mockResolvedValue(undefined),
      findByCurp: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    };
    const service = new StudentService(repo, defaultCategoryRepo, defaultDocumentRepo, auditService);
    await service.delete(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE', entityType: 'student', entityId: 1 })
    );
  });
});
