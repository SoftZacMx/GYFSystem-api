import type { Company } from '../entities';
import type { ICompanyRepository } from '../repositories/interfaces/ICompanyRepository';
import type { CreateCompanyBody, UpdateCompanyBody } from '../validators/company';
import { createAppError } from '../middlewares/global-error-handler';
import { decrypt, encrypt } from '../lib/encrypt';
import { env } from '../config/env';

export interface CompanyDto {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  timezone: string | null;
  themeConfig: { primaryColor?: string; accentColor?: string } | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFrom: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Configuración SMTP lista para usar en MailService (pass ya desencriptada). */
export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

function toDto(c: {
  id: number; name: string; email: string; phone: string | null; address: string | null;
  logoUrl: string | null; timezone: string | null; themeConfig: { primaryColor?: string; accentColor?: string } | null;
  smtpHost: string | null; smtpPort: number | null; smtpUser: string | null; smtpPass: string | null; smtpFrom: string | null;
  createdAt: Date; updatedAt: Date;
}): CompanyDto {
  const passDecrypted = c.smtpPass ? decrypt(c.smtpPass, env.ENCRYPTION_KEY) : '';
  return {
    id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address,
    logoUrl: c.logoUrl, timezone: c.timezone, themeConfig: c.themeConfig ?? null,
    smtpHost: c.smtpHost ?? null, smtpPort: c.smtpPort ?? null, smtpUser: c.smtpUser ?? null,
    smtpPass: passDecrypted || null, smtpFrom: c.smtpFrom ?? null,
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

  /**
   * Returns SMTP config from company (id 1) for sending emails. If any required field is missing, returns null
   * (caller should fall back to env SMTP).
   */
  async getSmtpConfig(): Promise<SmtpConfig | null> {
    const company = await this.companyRepository.findOne(1);
    if (!company?.smtpHost || company.smtpPort == null || !company.smtpUser || !company.smtpPass || !company.smtpFrom) {
      return null;
    }
    const pass = decrypt(company.smtpPass, env.ENCRYPTION_KEY);
    if (!pass) return null;
    return {
      host: company.smtpHost,
      port: company.smtpPort,
      user: company.smtpUser,
      pass,
      from: company.smtpFrom,
    };
  }

  async update(id: number, body: UpdateCompanyBody): Promise<CompanyDto> {
    const existing = await this.companyRepository.findOne(id);
    if (!existing) {
      throw createAppError('Company not found', 'NOT_FOUND');
    }
    const payload: Record<string, unknown> = { id, ...body };
    if (body.smtpPass !== undefined) {
      (payload as any).smtpPass = body.smtpPass && body.smtpPass.trim()
        ? encrypt(body.smtpPass.trim(), env.ENCRYPTION_KEY)
        : null;
    }
    const updated = await this.companyRepository.save(payload as any);
    return toDto(updated);
  }

  async create(body: CreateCompanyBody): Promise<CompanyDto> {
    const smtpPassEncrypted = body.smtpPass?.trim()
      ? encrypt(body.smtpPass.trim(), env.ENCRYPTION_KEY)
      : null;
    const created = await this.companyRepository.save({
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      address: body.address ?? null,
      logoUrl: body.logoUrl ?? null,
      timezone: body.timezone ?? null,
      themeConfig: body.themeConfig ?? null,
      smtpHost: body.smtpHost ?? null,
      smtpPort: body.smtpPort ?? null,
      smtpUser: body.smtpUser ?? null,
      smtpPass: smtpPassEncrypted,
      smtpFrom: body.smtpFrom ?? null,
    } as Partial<Company>);
    return toDto(created);
  }
}
