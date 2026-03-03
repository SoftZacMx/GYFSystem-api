import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '@/services/UserService';
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository';
import type { AuditService } from '@/services/AuditService';

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}));

import bcrypt from 'bcrypt';

function user(overrides: Partial<{ id: number; name: string; email: string; userTypeId: number; roleId: number; status: string }> = {}) {
  return {
    id: 1,
    name: 'Test',
    email: 'test@example.com',
    password: 'hash',
    userTypeId: 1,
    roleId: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('UserService', () => {
  let userRepository: IUserRepository;
  let auditService: AuditService;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      save: vi.fn(),
      delete: vi.fn(),
    };
    auditService = { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;
  });

  it('create: saves user and returns dto', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    const created = user({ id: 1, name: 'New', email: 'new@example.com' });
    vi.mocked(userRepository.save).mockResolvedValue(created as any);

    const service = new UserService(userRepository, auditService);
    const result = await service.create({
      name: 'New',
      email: 'new@example.com',
      password: 'secret',
      userTypeId: 1,
      roleId: 1,
      status: 'active',
    });

    expect(result).toMatchObject({ id: 1, name: 'New', email: 'new@example.com' });
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entityType: 'user', entityId: 1 })
    );
  });

  it('create: throws CONFLICT when email exists', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user() as any);

    const service = new UserService(userRepository, auditService);
    await expect(
      service.create({
        name: 'X',
        email: 'test@example.com',
        password: 'p',
        userTypeId: 1,
        roleId: 1,
        status: 'active',
      })
    ).rejects.toMatchObject({ message: 'Email already registered', code: 'CONFLICT' });
  });

  it('findById: returns user when found', async () => {
    const u = user();
    vi.mocked(userRepository.findById).mockResolvedValue(u as any);

    const service = new UserService(userRepository, auditService);
    const result = await service.findById(1);
    expect(result).toMatchObject({ id: 1, name: 'Test', email: 'test@example.com' });
  });

  it('findById: throws NOT_FOUND when missing', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const service = new UserService(userRepository, auditService);
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'User not found',
      code: 'NOT_FOUND',
    });
  });

  it('update: updates and returns dto', async () => {
    const existing = user();
    const updated = user({ id: 1, name: 'Updated' });
    vi.mocked(userRepository.findById).mockResolvedValue(existing as any);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.save).mockResolvedValue(updated as any);

    const service = new UserService(userRepository, auditService);
    const result = await service.update(1, { name: 'Updated' });
    expect(result.name).toBe('Updated');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'UPDATE', entityType: 'user', entityId: 1 })
    );
  });

  it('delete: deletes and audits', async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(user() as any);
    vi.mocked(userRepository.delete).mockResolvedValue(undefined);

    const service = new UserService(userRepository, auditService);
    await service.delete(1);
    expect(userRepository.delete).toHaveBeenCalledWith(1);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE', entityType: 'user', entityId: 1 })
    );
  });
});
