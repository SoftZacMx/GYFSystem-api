import { describe, it, expect, vi } from 'vitest';
import { CompanyService } from '@/services/CompanyService';
import type { ICompanyRepository } from '@/repositories/interfaces/ICompanyRepository';
import type { Company } from '@/entities';

function company(overrides: Partial<Company> = {}): Company {
  return {
    id: 1,
    name: 'Test Co',
    email: 'test@co.com',
    phone: null,
    address: null,
    logoUrl: null,
    timezone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('CompanyService', () => {
  describe('get', () => {
    it('returns company when found', async () => {
      const c = company();
      const repo: ICompanyRepository = {
        findOne: vi.fn().mockResolvedValue(c),
        save: vi.fn(),
      };
      const service = new CompanyService(repo);
      const result = await service.get(1);
      expect(result).toMatchObject({ id: 1, name: 'Test Co', email: 'test@co.com' });
      expect(repo.findOne).toHaveBeenCalledWith(1);
    });

    it('throws NOT_FOUND when company does not exist', async () => {
      const repo: ICompanyRepository = {
        findOne: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      };
      const service = new CompanyService(repo);
      await expect(service.get(999)).rejects.toMatchObject({
        message: 'Company not found',
        code: 'NOT_FOUND',
      });
    });
  });

  describe('update', () => {
    it('updates and returns company when found', async () => {
      const existing = company();
      const updated = company({ id: 1, name: 'Updated', email: 'up@co.com' });
      const repo: ICompanyRepository = {
        findOne: vi.fn().mockResolvedValue(existing),
        save: vi.fn().mockResolvedValue(updated),
      };
      const service = new CompanyService(repo);
      const result = await service.update(1, { name: 'Updated', email: 'up@co.com' });
      expect(result).toMatchObject({ id: 1, name: 'Updated', email: 'up@co.com' });
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'Updated', email: 'up@co.com' }));
    });

    it('throws NOT_FOUND when company does not exist', async () => {
      const repo: ICompanyRepository = {
        findOne: vi.fn().mockResolvedValue(null),
        save: vi.fn(),
      };
      const service = new CompanyService(repo);
      await expect(service.update(999, { name: 'X' })).rejects.toMatchObject({
        message: 'Company not found',
        code: 'NOT_FOUND',
      });
    });
  });

  describe('create', () => {
    it('creates and returns company', async () => {
      const created = company({ id: 1, name: 'New', email: 'new@co.com' });
      const repo: ICompanyRepository = {
        findOne: vi.fn(),
        save: vi.fn().mockResolvedValue(created),
      };
      const service = new CompanyService(repo);
      const result = await service.create({
        name: 'New',
        email: 'new@co.com',
      });
      expect(result).toMatchObject({ id: 1, name: 'New', email: 'new@co.com' });
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New',
          email: 'new@co.com',
          phone: null,
          address: null,
          logoUrl: null,
          timezone: null,
          themeConfig: null,
          smtpHost: null,
          smtpPort: null,
          smtpUser: null,
          smtpFrom: null,
        })
      );
    });
  });
});
