import type { ICompanyRepository } from '../repositories/interfaces/ICompanyRepository';
import type { CreateCompanyBody, UpdateCompanyBody } from '../validators/company';
import { createAppError } from '../middlewares/global-error-handler';

export interface CompanyDto {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  timezone: string | null;
  themeConfig: { primaryColor?: string; accentColor?: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(c: {
  id: number; name: string; email: string; phone: string | null; address: string | null;
  logoUrl: string | null; timezone: string | null; themeConfig: { primaryColor?: string; accentColor?: string } | null;
  createdAt: Date; updatedAt: Date;
}): CompanyDto {
  return {
    id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address,
    logoUrl: c.logoUrl, timezone: c.timezone, themeConfig: c.themeConfig ?? null,
    createdAt: c.createdAt, updatedAt: c.updatedAt,
  };
}

export class CompanyService {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async get(id: number): Promise<CompanyDto> {
    const company = await this.companyRepository.findOne(id);
    if (!company) {
      throw createAppError('Company not found', 'NOT_FOUND');
    }
    return toDto(company);
  }

  /** Public theme config for app bootstrap (no auth). Returns nulls if company or themeConfig missing. */
  async getThemeConfig(): Promise<{ primaryColor: string | null; accentColor: string | null }> {
    const company = await this.companyRepository.findOne(1);
    if (!company?.themeConfig) {
      return { primaryColor: null, accentColor: null };
    }
    return {
      primaryColor: company.themeConfig.primaryColor ?? null,
      accentColor: company.themeConfig.accentColor ?? null,
    };
  }

  async update(id: number, body: UpdateCompanyBody): Promise<CompanyDto> {
    const existing = await this.companyRepository.findOne(id);
    if (!existing) {
      throw createAppError('Company not found', 'NOT_FOUND');
    }
    const updated = await this.companyRepository.save({ id, ...body });
    return toDto(updated);
  }

  async create(body: CreateCompanyBody): Promise<CompanyDto> {
    const created = await this.companyRepository.save({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      address: body.address ?? null,
      logoUrl: body.logoUrl ?? null,
      timezone: body.timezone ?? null,
      themeConfig: body.themeConfig ?? null,
    });
    return toDto(created);
  }
}
