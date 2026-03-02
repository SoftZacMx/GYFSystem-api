import type { IStudentRepository } from '../repositories/interfaces/IStudentRepository';
import type { AuditService } from './AuditService';
import type { CreateStudentBody, UpdateStudentBody } from '../validators/student';
import { createAppError } from '../middlewares/global-error-handler';

export interface StudentDto {
  id: number;
  fullName: string;
  curp: string;
  grade: string;
  status: string;
  createdAt: Date;
}

function toDto(s: { id: number; fullName: string; curp: string; grade: string; status: string; createdAt: Date }): StudentDto {
  return { id: s.id, fullName: s.fullName, curp: s.curp, grade: s.grade, status: s.status, createdAt: s.createdAt };
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
    private readonly auditService: AuditService,
  ) {}

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
    return toDto(student);
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
    return { data: data.map(toDto), total };
  }

  async findById(id: number): Promise<StudentDto> {
    const student = await this.studentRepository.findById(id);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }
    return toDto(student);
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
    return toDto(updated);
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
