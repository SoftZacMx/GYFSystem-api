import { DataSource } from 'typeorm';
import { Student } from '../entities';
import type { IStudentRepository, StudentFindAllOptions } from './interfaces/IStudentRepository';

export class StudentRepository implements IStudentRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(Student);
  }

  async findById(id: number): Promise<Student | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(options?: StudentFindAllOptions): Promise<Student[]> {
    const sortField = options?.sortBy ?? 'id';
    const sortOrder = (options?.order ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    return this.repo.find({
      skip: options?.skip,
      take: options?.take,
      order: { [sortField]: sortOrder },
    });
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  async findByCurp(curp: string): Promise<Student | null> {
    return this.repo.findOne({ where: { curp } });
  }

  async save(student: Partial<Student>): Promise<Student> {
    return this.repo.save(student as Student);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
