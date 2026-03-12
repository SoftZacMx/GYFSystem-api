import { z } from 'zod';

export const companyIdQuerySchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CompanyIdQuery = z.infer<typeof companyIdQuerySchema>;

const themeConfigSchema = z.object({
  primaryColor: z.string().max(20).optional(),
  accentColor: z.string().max(20).optional(),
}).nullable().optional();

export const createCompanyBodySchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(2000).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
  themeConfig: themeConfigSchema,
  smtpHost: z.string().max(255).nullable().optional(),
  smtpPort: z.coerce.number().int().min(1).max(65535).nullable().optional(),
  smtpUser: z.string().max(255).nullable().optional(),
  smtpPass: z.string().max(500).nullable().optional(),
  smtpFrom: z.string().max(255).nullable().optional(),
});

export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;

export const updateCompanyBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(2000).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
  themeConfig: themeConfigSchema,
  smtpHost: z.string().max(255).nullable().optional(),
  smtpPort: z.coerce.number().int().min(1).max(65535).nullable().optional(),
  smtpUser: z.string().max(255).nullable().optional(),
  smtpPass: z.string().max(500).nullable().optional(),
  smtpFrom: z.string().max(255).nullable().optional(),
});

export type UpdateCompanyBody = z.infer<typeof updateCompanyBodySchema>;
