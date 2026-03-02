import { describe, it, expect, vi } from 'vitest';
import { RoleService } from './RoleService';
import type { IRoleRepository } from '../repositories/interfaces/IRoleRepository';

describe('RoleService', () => {
  it('findAll returns list of { id, name }', async () => {
    const repo: IRoleRepository = {
      findAll: vi.fn().mockResolvedValue([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Teacher' },
      ]),
      findById: vi.fn(),
    };
    const service = new RoleService(repo);
    const result = await service.findAll();
    expect(result).toEqual([{ id: 1, name: 'Admin' }, { id: 2, name: 'Teacher' }]);
  });

  it('findById returns role when found', async () => {
    const repo: IRoleRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Admin' }),
    };
    const service = new RoleService(repo);
    const result = await service.findById(1);
    expect(result).toEqual({ id: 1, name: 'Admin' });
  });

  it('findById throws NOT_FOUND when missing', async () => {
    const repo: IRoleRepository = {
      findAll: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
    };
    const service = new RoleService(repo);
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'Role not found',
      code: 'NOT_FOUND',
    });
  });
});
