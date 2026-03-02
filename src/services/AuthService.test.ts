import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthService } from './AuthService';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { AuditService } from './AuditService';

vi.mock('bcrypt', () => ({ default: { compare: vi.fn() } }));
vi.mock('../config/jwt', () => ({ signAccessToken: vi.fn().mockReturnValue('fake-jwt-token') }));

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed',
    roleId: 1,
    userTypeId: 1,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  let userRepository: IUserRepository;
  let auditService: AuditService;

  beforeEach(() => {
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    auditService = { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;
  });

  it('returns token and user on valid login', async () => {
    const u = user();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(u as any);

    const service = new AuthService(userRepository, auditService);
    const result = await service.login('test@example.com', 'password123');

    expect(result.token).toBe('fake-jwt-token');
    expect(result.user).toMatchObject({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      roleId: 1,
      userTypeId: 1,
      status: 'active',
    });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 1, action: 'LOGIN', entityType: 'user', entityId: 1 })
    );
  });

  it('throws UNAUTHORIZED when user not found', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const service = new AuthService(userRepository, auditService);
    await expect(service.login('unknown@example.com', 'pass')).rejects.toMatchObject({
      message: 'Invalid email or password',
      code: 'UNAUTHORIZED',
    });
  });

  it('throws UNAUTHORIZED when password does not match', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user() as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false);

    const service = new AuthService(userRepository, auditService);
    await expect(service.login('test@example.com', 'wrong')).rejects.toMatchObject({
      message: 'Invalid email or password',
      code: 'UNAUTHORIZED',
    });
  });
});
