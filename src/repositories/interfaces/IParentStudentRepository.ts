import { ParentStudent } from '../../entities';

export interface IParentStudentRepository {
  findByKey(userId: number, studentId: number): Promise<ParentStudent | null>;
  findByUserId(userId: number): Promise<ParentStudent[]>;
  findByStudentId(studentId: number): Promise<ParentStudent[]>;
  save(userId: number, studentId: number): Promise<ParentStudent>;
  delete(userId: number, studentId: number): Promise<void>;
}
