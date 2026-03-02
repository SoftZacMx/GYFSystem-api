import { DataSource } from 'typeorm';
import { ParentStudent } from '../entities';
import type { IParentStudentRepository } from './interfaces/IParentStudentRepository';

export class ParentStudentRepository implements IParentStudentRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(ParentStudent);
  }

  async findByKey(userId: number, studentId: number): Promise<ParentStudent | null> {
    return this.repo.findOne({ where: { userId, studentId } });
  }

  async findByUserId(userId: number): Promise<ParentStudent[]> {
    return this.repo.find({
      where: { userId },
      relations: ['student'],
    });
  }

  async findByStudentId(studentId: number): Promise<ParentStudent[]> {
    return this.repo.find({
      where: { studentId },
      relations: ['user'],
    });
  }

  async save(userId: number, studentId: number): Promise<ParentStudent> {
    return this.repo.save({ userId, studentId } as ParentStudent);
  }

  async delete(userId: number, studentId: number): Promise<void> {
    await this.repo.delete({ userId, studentId });
  }
}
