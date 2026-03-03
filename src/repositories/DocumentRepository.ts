import { DataSource, In, type FindOptionsWhere } from 'typeorm';
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

  async findAllByStudentIds(studentIds: number[]): Promise<Document[]> {
    if (studentIds.length === 0) return [];
    return this.repo.find({
      where: { studentId: In(studentIds) },
      order: { uploadedAt: 'DESC' },
    });
  }

  async findStudentCategoryPairs(): Promise<{ studentId: number; categoryId: number }[]> {
    const rows = await this.repo
      .createQueryBuilder('d')
      .select('d.student_id', 'studentId')
      .addSelect('d.category_id', 'categoryId')
      .distinct(true)
      .getRawMany<{ studentId: number; categoryId: number }>();
    return rows;
  }

  async findCategoryIdsByStudentId(studentId: number): Promise<number[]> {
    const rows = await this.repo
      .createQueryBuilder('d')
      .select('d.category_id', 'categoryId')
      .where('d.student_id = :studentId', { studentId })
      .distinct(true)
      .getRawMany<{ categoryId: number }>();
    return rows.map((r) => r.categoryId);
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
