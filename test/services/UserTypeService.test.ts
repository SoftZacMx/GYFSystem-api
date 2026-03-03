import { describe, it, expect, vi } from 'vitest';
import { UserTypeService } from '@/services/UserTypeService';
import type { IUserTypeRepository } from '@/repositories/interfaces/IUserTypeRepository';

describe('UserTypeService', () => {
  it('findAll returns list of { id, name }', async () => {
    const repo: IUserTypeRepository = {
      findAll: vi.fn().mockResolvedValue([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Teacher' },
      ]),
      findById: vi.fn(),
      save: vi.fn(),
    };
    const service = new UserTypeService(repo);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1, name: 'Admin' }, { id: 2, name: 'Teacher' }]);
  });

  it('findById returns type when found', async () => {
    const repo: IUserTypeRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Admin' }),
      save: vi.fn(),
    };
    const service = new UserTypeService(repo);
    const result = await service.findById(1);
    expect(result).toEqual({ id: 1, name: 'Admin' });
  });

  it('findById throws NOT_FOUND when missing', async () => {
    const repo: IUserTypeRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };
    const service = new UserTypeService(repo);
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'User type not found',
      code: 'NOT_FOUND',
    });
  });
});
