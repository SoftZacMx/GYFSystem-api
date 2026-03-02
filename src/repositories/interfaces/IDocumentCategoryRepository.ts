import { DocumentCategory } from '../../entities';

export interface IDocumentCategoryRepository {
  findById(id: number): Promise<DocumentCategory | null>;
  findAll(): Promise<DocumentCategory[]>;
  findByName(name: string): Promise<DocumentCategory | null>;
  save(category: Partial<DocumentCategory>): Promise<DocumentCategory>;
  delete(id: number): Promise<void>;
}
