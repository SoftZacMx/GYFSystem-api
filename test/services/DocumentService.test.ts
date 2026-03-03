import { describe, it, expect, vi } from 'vitest';
import { DocumentService } from '@/services/DocumentService';
import type { IDocumentRepository } from '@/repositories/interfaces/IDocumentRepository';
import type { IStudentRepository } from '@/repositories/interfaces/IStudentRepository';
import type { IDocumentCategoryRepository } from '@/repositories/interfaces/IDocumentCategoryRepository';
import type { StorageService } from '@/services/StorageService';
import type { SignatureService } from '@/services/SignatureService';
import type { AuditService } from '@/services/AuditService';

function doc(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    studentId: 1,
    categoryId: 1,
    uploadedBy: 1,
    fileUrl: 'https://bucket.s3.region.amazonaws.com/documents/uuid.pdf',
    signatureHash: null,
    uploadedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

describe('DocumentService', () => {
  const appUrl = 'http://localhost:3000';
  const auditService = { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;
  const storageService = {
    upload: vi.fn(),
    download: vi.fn(),
    delete: vi.fn(),
    deleteByFileUrl: vi.fn(),
  } as unknown as StorageService;
  const signatureService = {
    sign: vi.fn().mockReturnValue('base64hash'),
    verify: vi.fn().mockReturnValue(true),
  } as unknown as SignatureService;

  it('create saves new document when no existing', async () => {
    const studentRepo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, fullName: 'S', curp: 'C', grade: '1st', status: 'active', createdAt: new Date(), updatedAt: new Date() }),
      findByCurp: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const categoryRepo: IDocumentCategoryRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'ID', description: null }),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const documentRepo: IDocumentRepository = {
      findByStudentIdAndCategoryId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(doc({ id: 1 })),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      softDelete: vi.fn(),
    };
    const service = new DocumentService(
      documentRepo,
      studentRepo,
      categoryRepo,
      storageService,
      auditService,
      signatureService,
      appUrl
    );
    const result = await service.create(
      { studentId: 1, categoryId: 1, fileUrl: 'https://x.com/f.pdf', signatureHash: null },
      1
    );
    expect(result).toMatchObject({ id: 1, studentId: 1, categoryId: 1, uploadedBy: 1 });
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entityType: 'document', entityId: 1 })
    );
  });

  it('create throws NOT_FOUND when student missing', async () => {
    const studentRepo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByCurp: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const categoryRepo: IDocumentCategoryRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1 }),
      findByName: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const documentRepo: IDocumentRepository = {
      findByStudentIdAndCategoryId: vi.fn(),
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      softDelete: vi.fn(),
    };
    const service = new DocumentService(
      documentRepo,
      studentRepo,
      categoryRepo,
      storageService,
      auditService,
      signatureService,
      appUrl
    );
    await expect(
      service.create({ studentId: 999, categoryId: 1, fileUrl: 'x', signatureHash: null }, 1)
    ).rejects.toMatchObject({ message: 'Student not found', code: 'NOT_FOUND' });
  });

  it('findById returns document when found', async () => {
    const documentRepo: IDocumentRepository = {
      findById: vi.fn().mockResolvedValue(doc()),
      findByStudentIdAndCategoryId: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      softDelete: vi.fn(),
    };
    const studentRepo = { findById: vi.fn(), findByCurp: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const categoryRepo = { findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new DocumentService(
      documentRepo,
      studentRepo as any,
      categoryRepo as any,
      storageService,
      auditService,
      signatureService,
      appUrl
    );
    const result = await service.findById(1);
    expect(result).toMatchObject({ id: 1, studentId: 1, categoryId: 1 });
  });

  it('findById throws NOT_FOUND when missing', async () => {
    const documentRepo: IDocumentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByStudentIdAndCategoryId: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      softDelete: vi.fn(),
    };
    const studentRepo = { findById: vi.fn(), findByCurp: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const categoryRepo = { findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new DocumentService(
      documentRepo,
      studentRepo as any,
      categoryRepo as any,
      storageService,
      auditService,
      signatureService,
      appUrl
    );
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'Document not found',
      code: 'NOT_FOUND',
    });
  });

  it('findAll returns data and total', async () => {
    const documentRepo: IDocumentRepository = {
      findAll: vi.fn().mockResolvedValue([doc()]),
      count: vi.fn().mockResolvedValue(1),
      findById: vi.fn(),
      findByStudentIdAndCategoryId: vi.fn(),
      save: vi.fn(),
      softDelete: vi.fn(),
    };
    const studentRepo = { findById: vi.fn(), findByCurp: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const categoryRepo = { findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new DocumentService(
      documentRepo,
      studentRepo as any,
      categoryRepo as any,
      storageService,
      auditService,
      signatureService,
      appUrl
    );
    const result = await service.findAll({ page: 1, limit: 10, order: 'asc' });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('softDelete throws NOT_FOUND when document missing', async () => {
    const documentRepo: IDocumentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByStudentIdAndCategoryId: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      softDelete: vi.fn(),
    };
    const studentRepo = { findById: vi.fn(), findByCurp: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const categoryRepo = { findById: vi.fn(), findByName: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new DocumentService(
      documentRepo,
      studentRepo as any,
      categoryRepo as any,
      storageService,
      auditService,
      signatureService,
      appUrl
    );
    await expect(service.softDelete(999)).rejects.toMatchObject({
      message: 'Document not found',
      code: 'NOT_FOUND',
    });
  });
});
