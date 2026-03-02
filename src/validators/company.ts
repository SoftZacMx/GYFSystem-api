import { z } from 'zod';

export const companyIdQuerySchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CompanyIdQuery = z.infer<typeof companyIdQuerySchema>;

export const createCompanyBodySchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(2000).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
});

export type CreateCompanyBody = z.infer<typeof createCompanyBodySchema>;

export const updateCompanyBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).nullable().optional(),
  address: z.string().max(2000).nullable().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  timezone: z.string().max(50).nullable().optional(),
});

export type UpdateCompanyBody = z.infer<typeof updateCompanyBodySchema>;
