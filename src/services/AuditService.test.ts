import { describe, it, expect, vi } from 'vitest';
import { AuditService } from './AuditService';
import type { IAuditLogRepository } from '../repositories/interfaces/IAuditLogRepository';

describe('AuditService', () => {
  it('log saves entry to repository', async () => {
    const repo: IAuditLogRepository = {
      save: vi.fn().mockResolvedValue({ id: 1, userId: 1, action: 'LOGIN', entityType: 'user', entityId: 1, ip: null, createdAt: new Date() }),
      findAll: vi.fn(),
      count: vi.fn(),
    };
    const service = new AuditService(repo);
    await service.log({
      userId: 1,
      action: 'LOGIN',
      entityType: 'user',
      entityId: 1,
      ip: '127.0.0.1',
    });
    expect(repo.save).toHaveBeenCalledWith({
      userId: 1,
      action: 'LOGIN',
      entityType: 'user',
      entityId: 1,
      ip: '127.0.0.1',
    });
  });

  it('log passes null for optional fields when omitted', async () => {
    const repo: IAuditLogRepository = {
      save: vi.fn().mockResolvedValue({}),
      findAll: vi.fn(),
      count: vi.fn(),
    };
    const service = new AuditService(repo);
    await service.log({ action: 'EXPORT', entityType: 'document' });
    expect(repo.save).toHaveBeenCalledWith({
      userId: null,
      action: 'EXPORT',
      entityType: 'document',
      entityId: null,
      ip: null,
    });
  });

  it('findAll returns data, total, page, limit', async () => {
    const entries = [
      { id: 1, userId: 1, action: 'LOGIN', entityType: 'user', entityId: 1, ip: null, createdAt: new Date() },
    ];
    const repo: IAuditLogRepository = {
      save: vi.fn(),
      findAll: vi.fn().mockResolvedValue(entries),
      count: vi.fn().mockResolvedValue(1),
    };
    const service = new AuditService(repo);
    const result = await service.findAll({ page: 1, limit: 50 });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(50);
  });
});
