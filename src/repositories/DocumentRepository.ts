import { DataSource, type FindOptionsWhere } from 'typeorm';
import { Document } from '../entities';
import type { IDocumentRepository, DocumentFindAllOptions } from './interfaces/IDocumentRepository';

export class DocumentRepository implements IDocumentRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(Document);
  }

  async findById(id: number): Promise<Document | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findByStudentIdAndCategoryId(studentId: number, categoryId: number): Promise<Document | null> {
    return this.repo.findOne({ where: { studentId, categoryId }, withDeleted: true });
  }

  async findAll(options?: DocumentFindAllOptions): Promise<Document[]> {
    const where = this.buildWhere(options);
    const sortField = options?.sortBy ?? 'id';
    const sortOrder = (options?.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';

    return this.repo.find({
      where,
      skip: options?.skip,
      take: options?.take,
      order: { [sortField]: sortOrder },
    });
  }

  async count(filters?: { studentId?: number; categoryId?: number }): Promise<number> {
    const where = this.buildWhere(filters);
    return this.repo.count({ where });
  }

  async save(document: Partial<Document>): Promise<Document> {
    return this.repo.save(document as Document);
  }

  async softDelete(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  private buildWhere(filters?: { studentId?: number; categoryId?: number }): FindOptionsWhere<Document> {
    const where: FindOptionsWhere<Document> = {};
    if (filters?.studentId !== undefined) where.studentId = filters.studentId;
    if (filters?.categoryId !== undefined) where.categoryId = filters.categoryId;
    return where;
  }
}
