import { DataSource } from 'typeorm';
import { DocumentCategory } from '../entities';
import type { IDocumentCategoryRepository } from './interfaces/IDocumentCategoryRepository';

export class DocumentCategoryRepository implements IDocumentCategoryRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(DocumentCategory);
  }

  async findById(id: number): Promise<DocumentCategory | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<DocumentCategory[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findByName(name: string): Promise<DocumentCategory | null> {
    return this.repo.findOne({ where: { name } });
  }

  async save(category: Partial<DocumentCategory>): Promise<DocumentCategory> {
    return this.repo.save(category as DocumentCategory);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
