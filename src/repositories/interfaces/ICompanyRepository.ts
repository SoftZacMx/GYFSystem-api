import { Company } from '../../entities';

export interface ICompanyRepository {
  findOne(id: number): Promise<Company | null>;
  save(company: Partial<Company>): Promise<Company>;
}
