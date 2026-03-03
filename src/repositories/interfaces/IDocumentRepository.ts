import { Document } from '../../entities';

export interface DocumentFindAllOptions {
  studentId?: number;
  categoryId?: number;
  skip?: number;
  take?: number;
  sortBy?: 'id' | 'uploadedAt' | 'studentId' | 'categoryId';
  order?: 'asc' | 'desc';
}

export interface IDocumentRepository {
  findById(id: number): Promise<Document | null>;
  findByStudentIdAndCategoryId(studentId: number, categoryId: number): Promise<Document | null>;
  findAll(options?: DocumentFindAllOptions): Promise<Document[]>;
  findAllByStudentIds(studentIds: number[]): Promise<Document[]>;
  findStudentCategoryPairs(): Promise<{ studentId: number; categoryId: number }[]>;
  findCategoryIdsByStudentId(studentId: number): Promise<number[]>;
  count(filters?: { studentId?: number; categoryId?: number }): Promise<number>;
  save(document: Partial<Document>): Promise<Document>;
  softDelete(id: number): Promise<void>;
}
