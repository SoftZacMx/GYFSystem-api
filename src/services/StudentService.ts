import type { IStudentRepository } from '../repositories/interfaces/IStudentRepository';
import type { IDocumentCategoryRepository } from '../repositories/interfaces/IDocumentCategoryRepository';
import type { IDocumentRepository } from '../repositories/interfaces/IDocumentRepository';
import type { AuditService } from './AuditService';
import type { CreateStudentBody, UpdateStudentBody } from '../validators/student';
import { createAppError } from '../middlewares/global-error-handler';

export interface StudentFileItem {
  category: string;
  isUpload: boolean;
}

export interface StudentDto {
  id: number;
  fullName: string;
  curp: string;
  grade: string;
  status: string;
  createdAt: Date;
  files: StudentFileItem[];
  totalUploadFiles: number;
  totalPendingFiles: number;
}

function countFiles(files: StudentFileItem[]): { totalUploadFiles: number; totalPendingFiles: number } {
  const totalUploadFiles = files.reduce((acc, f) => acc + (f.isUpload ? 1 : 0), 0);
  const totalPendingFiles = files.length - totalUploadFiles;
  return { totalUploadFiles, totalPendingFiles };
}

function toDto(
  s: { id: number; fullName: string; curp: string; grade: string; status: string; createdAt: Date },
  files: StudentFileItem[]
): StudentDto {
  const { totalUploadFiles, totalPendingFiles } = countFiles(files);
  return {
    id: s.id,
    fullName: s.fullName,
    curp: s.curp,
    grade: s.grade,
    status: s.status,
    createdAt: s.createdAt,
    files,
    totalUploadFiles,
    totalPendingFiles,
  };
}

export interface StudentListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order: 'asc' | 'desc';
}

export interface StudentListResult {
  data: StudentDto[];
  total: number;
}

export class StudentService {
  constructor(
    private readonly studentRepository: IStudentRepository,
    private readonly documentCategoryRepository: IDocumentCategoryRepository,
    private readonly documentRepository: IDocumentRepository,
    private readonly auditService: AuditService,
  ) {}

  private buildFiles(categoryIds: Set<number>, categories: { id: number; name: string }[]): StudentFileItem[] {
    return categories.map((c) => ({
      category: c.name,
      isUpload: categoryIds.has(c.id),
    }));
  }

  private async getFilesForStudent(studentId: number): Promise<StudentFileItem[]> {
    const [categories, categoryIds] = await Promise.all([
      this.documentCategoryRepository.findAll(),
      this.documentRepository.findCategoryIdsByStudentId(studentId),
    ]);
    const set = new Set(categoryIds);
    return this.buildFiles(set, categories);
  }

  private async getFilesForStudents(studentIds: number[]): Promise<Map<number, StudentFileItem[]>> {
    const [categories, pairs] = await Promise.all([
      this.documentCategoryRepository.findAll(),
      this.documentRepository.findStudentCategoryPairs(),
    ]);
    const byStudent = new Map<number, Set<number>>();
    for (const { studentId, categoryId } of pairs) {
      let set = byStudent.get(studentId);
      if (!set) {
        set = new Set();
        byStudent.set(studentId, set);
      }
      set.add(categoryId);
    }
    const result = new Map<number, StudentFileItem[]>();
    for (const id of studentIds) {
      const set = byStudent.get(id) ?? new Set();
      result.set(id, this.buildFiles(set, categories));
    }
    return result;
  }

  async create(body: CreateStudentBody, performedBy?: number, ip?: string): Promise<StudentDto> {
    const existing = await this.studentRepository.findByCurp(body.curp);
    if (existing) {
      throw createAppError('CURP already registered', 'CONFLICT');
    }
    const student = await this.studentRepository.save({
      fullName: body.fullName,
      curp: body.curp,
      grade: body.grade,
      status: body.status,
    });
    this.auditService.log({ userId: performedBy, action: 'CREATE', entityType: 'student', entityId: student.id, ip });
    const files = await this.getFilesForStudent(student.id);
    return toDto(student, files);
  }

  async findAll(options: StudentListOptions): Promise<StudentListResult> {
    const skip = (options.page - 1) * options.limit;
    const [data, total] = await Promise.all([
      this.studentRepository.findAll({
        skip,
        take: options.limit,
        sortBy: options.sortBy as any,
        order: options.order,
      }),
      this.studentRepository.count(),
    ]);
    const studentIds = data.map((s) => s.id);
    const filesMap = await this.getFilesForStudents(studentIds);
    const dtos = data.map((s) => toDto(s, filesMap.get(s.id) ?? []));
    return { data: dtos, total };
  }

  async findById(id: number): Promise<StudentDto> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }
    const files = await this.getFilesForStudent(id);
    return toDto(student, files);
  }

  /** Returns full StudentDto (with files, totalUploadFiles, totalPendingFiles) for the given ids. */
  async findByIds(ids: number[]): Promise<StudentDto[]> {
    if (ids.length === 0) return [];
    const students = await this.studentRepository.findByIds(ids);
    const filesMap = await this.getFilesForStudents(ids);
    return students.map((s) => toDto(s, filesMap.get(s.id) ?? []));
  }

  async update(id: number, body: UpdateStudentBody, performedBy?: number, ip?: string): Promise<StudentDto> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }
    if (body.curp !== undefined && body.curp !== student.curp) {
      const existing = await this.studentRepository.findByCurp(body.curp);
      if (existing) {
        throw createAppError('CURP already registered', 'CONFLICT');
      }
    }
    const updated = await this.studentRepository.save({ id, ...body });
    this.auditService.log({ userId: performedBy, action: 'UPDATE', entityType: 'student', entityId: id, ip });
    const files = await this.getFilesForStudent(id);
    return toDto(updated, files);
  }

  async delete(id: number, performedBy?: number, ip?: string): Promise<void> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }
    await this.studentRepository.delete(id);
    this.auditService.log({ userId: performedBy, action: 'DELETE', entityType: 'student', entityId: id, ip });
  }
}
