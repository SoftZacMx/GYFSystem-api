import type { Request, Response, NextFunction } from 'express';
import type { DocumentService } from '../services/DocumentService';
import type { ParentStudentService } from '../services/ParentStudentService';
import QRCode from 'qrcode';
import { createAppError } from '../middlewares/global-error-handler';
import { success, successList, listMeta } from '../views';
import { createDocumentBodySchema, documentQuerySchema } from '../validators/document';
import { uploadDocumentFieldsSchema } from '../validators/upload';

export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly appUrl: string,
    private readonly parentStudentService: ParentStudentService,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = createDocumentBodySchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }

    const uploadedBy = req.user?.sub;
    if (!uploadedBy) { next(createAppError('Authentication required', 'UNAUTHORIZED')); return; }

    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.documentService.create(parsed.data, uploadedBy, ip ?? undefined);
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = documentQuerySchema.safeParse(req.query);
    if (!parsed.success) { next(parsed.error); return; }
    const { page, limit, sortBy, order, studentId, categoryId } = parsed.data;
    try {
      const { data, total } = await this.documentService.findAll({ page, limit, sortBy, order, studentId, categoryId });
      successList(res, data, listMeta(page, limit, total));
    } catch (err) { next(err); }
  }

  async listGroupedByMyStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    const userId = req.user?.sub;
    if (!userId) { next(createAppError('Authentication required', 'UNAUTHORIZED')); return; }
    try {
      const students = await this.parentStudentService.findStudentsByUserId(userId);
      const studentIds = students.map((s) => s.studentId);
      const documents = await this.documentService.findDocumentsByStudentIds(studentIds);
      const byStudent = new Map<number, typeof documents>();
      for (const doc of documents) {
        const list = byStudent.get(doc.studentId) ?? [];
        list.push(doc);
        byStudent.set(doc.studentId, list);
      }
      const groups = students.map((student) => ({
        student: {
          studentId: student.studentId,
          fullName: student.fullName,
          curp: student.curp,
          grade: student.grade,
          status: student.status,
        },
        documents: byStudent.get(student.studentId) ?? [],
      }));
      success(res, { groups });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const data = await this.documentService.findById(id);
      success(res, data);
    } catch (err) { next(err); }
  }

  private static mimeFromFileName(fileName: string): string {
    const ext = fileName.includes('.') ? fileName.slice(fileName.lastIndexOf('.')).toLowerCase() : '';
    const map: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };
    return map[ext] ?? 'application/octet-stream';
  }

  async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const { buffer, fileName } = await this.documentService.download(id);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', DocumentController.mimeFromFileName(fileName));
      res.send(buffer);
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      await this.documentService.softDelete(id, req.user?.sub, ip ?? undefined);
      res.status(204).send();
    } catch (err) { next(err); }
  }

  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uploadedBy = req.user?.sub;
    if (!uploadedBy) { next(createAppError('Authentication required', 'UNAUTHORIZED')); return; }

    if (!req.file) { next(createAppError('File is required', 'VALIDATION_ERROR')); return; }

    const parsed = uploadDocumentFieldsSchema.safeParse(req.body);
    if (!parsed.success) { next(parsed.error); return; }

    try {
      const ip = req.ip ?? req.socket.remoteAddress;
      const data = await this.documentService.upload(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        parsed.data.studentId,
        parsed.data.categoryId,
        uploadedBy,
        ip ?? undefined,
        parsed.data.sign,
      );
      success(res, data, undefined, 201);
    } catch (err) { next(err); }
  }

  async verifySignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const result = await this.documentService.verify(id);
      success(res, {
        valid: result.valid,
        documentId: result.document.id,
        studentId: result.document.studentId,
        categoryId: result.document.categoryId,
        uploadedBy: result.document.uploadedBy,
        uploadedAt: result.document.uploadedAt,
        verifyUrl: result.verifyUrl,
        message: result.valid
          ? 'Document signature is valid. The file has not been altered.'
          : 'Document signature is INVALID. The file may have been tampered with.',
      });
    } catch (err) { next(err); }
  }

  async qrCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id) || id < 1) { next(createAppError('Invalid id', 'BAD_REQUEST')); return; }
    try {
      const doc = await this.documentService.findById(id);
      if (!doc.signatureHash) {
        next(createAppError('Document was not digitally signed', 'BAD_REQUEST'));
        return;
      }
      const verifyUrl = `${this.appUrl}/documents/${id}/verify`;
      const qrBuffer = await QRCode.toBuffer(verifyUrl, { type: 'png', width: 300, margin: 2 });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="document-${id}-qr.png"`);
      res.send(qrBuffer);
    } catch (err) { next(err); }
  }
}
