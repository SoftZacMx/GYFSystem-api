import { DataSource } from 'typeorm';
import { Company } from '../entities';
import type { ICompanyRepository } from './interfaces/ICompanyRepository';

export class CompanyRepository implements ICompanyRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(Company);
  }

  async findOne(id: number): Promise<Company | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(company: Partial<Company>): Promise<Company> {
    return this.repo.save(company as Company);
  }
}
