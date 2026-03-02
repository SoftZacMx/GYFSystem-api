import type { IDocumentRepository } from '../repositories/interfaces/IDocumentRepository';
import type { IStudentRepository } from '../repositories/interfaces/IStudentRepository';
import type { IDocumentCategoryRepository } from '../repositories/interfaces/IDocumentCategoryRepository';
import type { StorageService } from './StorageService';
import type { SignatureService } from './SignatureService';
import type { AuditService } from './AuditService';
import type { CreateDocumentBody } from '../validators/document';
import { createAppError } from '../middlewares/global-error-handler';

function tryDecodeUri(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export interface DocumentDto {
  id: number;
  studentId: number;
  categoryId: number;
  uploadedBy: number;
  fileUrl: string;
  signatureHash: string | null;
  uploadedAt: Date;
  verifiedAt: Date | null;
  verified: boolean;
}

function toDto(d: {
  id: number; studentId: number; categoryId: number; uploadedBy: number;
  fileUrl: string; signatureHash: string | null; uploadedAt: Date; verifiedAt?: Date | null;
}): DocumentDto {
  return {
    id: d.id, studentId: d.studentId, categoryId: d.categoryId,
    uploadedBy: d.uploadedBy, fileUrl: d.fileUrl,
    signatureHash: d.signatureHash, uploadedAt: d.uploadedAt,
    verifiedAt: d.verifiedAt ?? null,
    verified: d.verifiedAt != null,
  };
}

export interface DocumentListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order: 'asc' | 'desc';
  studentId?: number;
  categoryId?: number;
}

export interface DocumentListResult {
  data: DocumentDto[];
  total: number;
}

export class DocumentService {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly studentRepository: IStudentRepository,
    private readonly categoryRepository: IDocumentCategoryRepository,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
    private readonly signatureService: SignatureService,
    private readonly appUrl: string,
  ) {}

  async create(body: CreateDocumentBody, uploadedBy: number, ip?: string): Promise<DocumentDto> {
    const student = await this.studentRepository.findById(body.studentId);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }

    const category = await this.categoryRepository.findById(body.categoryId);
    if (!category) {
      throw createAppError('Document category not found', 'NOT_FOUND');
    }

    const existing = await this.documentRepository.findByStudentIdAndCategoryId(body.studentId, body.categoryId);

    const verifiedAt = body.signatureHash ? new Date() : null;
    if (existing) {
      const updated = await this.documentRepository.save({
        id: existing.id,
        studentId: body.studentId,
        categoryId: body.categoryId,
        uploadedBy,
        fileUrl: body.fileUrl,
        signatureHash: body.signatureHash ?? null,
        uploadedAt: new Date(),
        verifiedAt,
        deletedAt: null,
      });
      this.auditService.log({ userId: uploadedBy, action: 'UPDATE', entityType: 'document', entityId: updated.id, ip });
      return toDto(updated);
    }

    const document = await this.documentRepository.save({
      studentId: body.studentId,
      categoryId: body.categoryId,
      uploadedBy,
      fileUrl: body.fileUrl,
      signatureHash: body.signatureHash ?? null,
      verifiedAt,
    });
    this.auditService.log({ userId: uploadedBy, action: 'CREATE', entityType: 'document', entityId: document.id, ip });
    return toDto(document);
  }

  async findAll(options: DocumentListOptions): Promise<DocumentListResult> {
    const skip = (options.page - 1) * options.limit;
    const filters = { studentId: options.studentId, categoryId: options.categoryId };

    const [data, total] = await Promise.all([
      this.documentRepository.findAll({
        ...filters,
        skip,
        take: options.limit,
        sortBy: options.sortBy as any,
        order: options.order,
      }),
      this.documentRepository.count(filters),
    ]);
    return { data: data.map(toDto), total };
  }

  async findById(id: number): Promise<DocumentDto> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw createAppError('Document not found', 'NOT_FOUND');
    }
    return toDto(document);
  }

  async softDelete(id: number, performedBy?: number, ip?: string): Promise<void> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw createAppError('Document not found', 'NOT_FOUND');
    }
    await this.documentRepository.softDelete(id);
    this.auditService.log({ userId: performedBy, action: 'SOFT_DELETE', entityType: 'document', entityId: id, ip });
  }

  async upload(
    file: Buffer,
    originalName: string,
    mimeType: string,
    studentId: number,
    categoryId: number,
    uploadedBy: number,
    ip?: string,
    sign?: boolean,
  ): Promise<DocumentDto> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw createAppError('Document category not found', 'NOT_FOUND');
    }

    const { fileUrl } = await this.storageService.upload(file, originalName, mimeType);
    const signatureHash = sign ? this.signatureService.sign(file) : null;

    const existing = await this.documentRepository.findByStudentIdAndCategoryId(studentId, categoryId);

    if (existing) {
      try {
        await this.storageService.deleteByFileUrl(existing.fileUrl);
      } catch {
        // Best effort: do not fail upload if old file deletion fails
      }
      const updated = await this.documentRepository.save({
        id: existing.id,
        studentId,
        categoryId,
        uploadedBy,
        fileUrl,
        signatureHash,
        uploadedAt: new Date(),
        verifiedAt: sign ? new Date() : null,
        deletedAt: null,
      });
      const action = sign ? 'UPLOAD_SIGNED' : 'UPLOAD';
      this.auditService.log({ userId: uploadedBy, action: 'UPDATE', entityType: 'document', entityId: updated.id, ip });
      return toDto(updated);
    }

    const document = await this.documentRepository.save({
      studentId,
      categoryId,
      uploadedBy,
      fileUrl,
      signatureHash,
      verifiedAt: sign ? new Date() : null,
    });
    const action = sign ? 'UPLOAD_SIGNED' : 'UPLOAD';
    this.auditService.log({ userId: uploadedBy, action, entityType: 'document', entityId: document.id, ip });
    return toDto(document);
  }

  async download(id: number): Promise<{ buffer: Buffer; fileName: string }> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw createAppError('Document not found', 'NOT_FOUND');
    }
    const buffer = await this.storageService.download(document.fileUrl);
    const fileName = document.fileUrl.split('/').filter(Boolean).pop() ?? `document-${id}`;
    const decodedFileName = tryDecodeUri(fileName);
    return { buffer, fileName: decodedFileName };
  }

  async verify(id: number): Promise<{
    valid: boolean;
    document: DocumentDto;
    verifyUrl: string;
  }> {
    const document = await this.documentRepository.findById(id);
    if (!document) {
      throw createAppError('Document not found', 'NOT_FOUND');
    }
    if (!document.signatureHash) {
      throw createAppError('Document was not digitally signed', 'BAD_REQUEST');
    }

    const fileBuffer = await this.storageService.download(document.fileUrl);
    const valid = this.signatureService.verify(fileBuffer, document.signatureHash);
    const verifiedAt = valid ? new Date() : null;
    await this.documentRepository.save({ id: document.id, verifiedAt });
    const updated = { ...document, verifiedAt };
    const verifyUrl = `${this.appUrl}/documents/${id}/verify`;

    return { valid, document: toDto(updated), verifyUrl };
  }
}
