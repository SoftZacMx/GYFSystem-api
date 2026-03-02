import type { IParentStudentRepository } from '../repositories/interfaces/IParentStudentRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { IStudentRepository } from '../repositories/interfaces/IStudentRepository';
import { createAppError } from '../middlewares/global-error-handler';

export interface ParentStudentDto {
  userId: number;
  studentId: number;
}

export interface StudentOfParentDto {
  studentId: number;
  fullName: string;
  curp: string;
  grade: string;
  status: string;
}

export interface ParentOfStudentDto {
  userId: number;
  name: string;
  email: string;
}

export class ParentStudentService {
  constructor(
    private readonly parentStudentRepository: IParentStudentRepository,
    private readonly userRepository: IUserRepository,
    private readonly studentRepository: IStudentRepository,
  ) {}

  async associate(userId: number, studentId: number): Promise<ParentStudentDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createAppError('User not found', 'NOT_FOUND');
    }

    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }

    const existing = await this.parentStudentRepository.findByKey(userId, studentId);
    if (existing) {
      throw createAppError('Association already exists', 'CONFLICT');
    }

    await this.parentStudentRepository.save(userId, studentId);
    return { userId, studentId };
  }

  async disassociate(userId: number, studentId: number): Promise<void> {
    const existing = await this.parentStudentRepository.findByKey(userId, studentId);
    if (!existing) {
      throw createAppError('Association not found', 'NOT_FOUND');
    }
    await this.parentStudentRepository.delete(userId, studentId);
  }

  async findStudentsByUserId(userId: number): Promise<StudentOfParentDto[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw createAppError('User not found', 'NOT_FOUND');
    }

    const links = await this.parentStudentRepository.findByUserId(userId);
    return links.map((link) => ({
      studentId: link.student.id,
      fullName: link.student.fullName,
      curp: link.student.curp,
      grade: link.student.grade,
      status: link.student.status,
    }));
  }

  async findParentsByStudentId(studentId: number): Promise<ParentOfStudentDto[]> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw createAppError('Student not found', 'NOT_FOUND');
    }

    const links = await this.parentStudentRepository.findByStudentId(studentId);
    return links.map((link) => ({
      userId: link.user.id,
      name: link.user.name,
      email: link.user.email,
    }));
  }
}
