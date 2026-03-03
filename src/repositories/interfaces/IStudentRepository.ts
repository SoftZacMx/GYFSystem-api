import { Student } from '../../entities';

export interface StudentFindAllOptions {
  skip?: number;
  take?: number;
  sortBy?: keyof Pick<Student, 'id' | 'fullName' | 'curp' | 'grade' | 'status' | 'createdAt'>;
  order?: 'asc' | 'desc';
}

export interface IStudentRepository {
  findById(id: number): Promise<Student | null>;
  findByIds(ids: number[]): Promise<Student[]>;
  findAll(options?: StudentFindAllOptions): Promise<Student[]>;
  count(): Promise<number>;
  findByCurp(curp: string): Promise<Student | null>;
  save(student: Partial<Student>): Promise<Student>;
  delete(id: number): Promise<void>;
}
