import { describe, it, expect, vi } from 'vitest';
import { ParentStudentService } from '@/services/ParentStudentService';
import type { IParentStudentRepository } from '@/repositories/interfaces/IParentStudentRepository';
import type { IUserRepository } from '@/repositories/interfaces/IUserRepository';
import type { IStudentRepository } from '@/repositories/interfaces/IStudentRepository';

describe('ParentStudentService', () => {
  it('associate creates link when user and student exist', async () => {
    const userRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'Parent', email: 'p@x.com' }),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const studentRepo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: 10, fullName: 'Student', curp: 'C', grade: '1st', status: 'active', createdAt: new Date(), updatedAt: new Date() }),
      findByCurp: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const parentStudentRepo: IParentStudentRepository = {
      findByKey: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue({ userId: 1, studentId: 10 } as any),
      findByUserId: vi.fn(),
      findByStudentId: vi.fn(),
      delete: vi.fn(),
    };
    const service = new ParentStudentService(parentStudentRepo, userRepo, studentRepo);
    const result = await service.associate(1, 10);
    expect(result).toEqual({ userId: 1, studentId: 10 });
    expect(parentStudentRepo.save).toHaveBeenCalledWith(1, 10);
  });

  it('associate throws NOT_FOUND when user missing', async () => {
    const userRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const studentRepo: IStudentRepository = {
      findById: vi.fn(),
      findByCurp: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const parentStudentRepo: IParentStudentRepository = {
      findByKey: vi.fn(),
      save: vi.fn(),
      findByUserId: vi.fn(),
      findByStudentId: vi.fn(),
      delete: vi.fn(),
    };
    const service = new ParentStudentService(parentStudentRepo, userRepo, studentRepo);
    await expect(service.associate(999, 10)).rejects.toMatchObject({
      message: 'User not found',
      code: 'NOT_FOUND',
    });
  });

  it('associate throws CONFLICT when link already exists', async () => {
    const userRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1 }),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const studentRepo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: 10, fullName: 'S', curp: 'C', grade: '1st', status: 'active', createdAt: new Date(), updatedAt: new Date() }),
      findByCurp: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const parentStudentRepo: IParentStudentRepository = {
      findByKey: vi.fn().mockResolvedValue({ userId: 1, studentId: 10 }),
      save: vi.fn(),
      findByUserId: vi.fn(),
      findByStudentId: vi.fn(),
      delete: vi.fn(),
    };
    const service = new ParentStudentService(parentStudentRepo, userRepo, studentRepo);
    await expect(service.associate(1, 10)).rejects.toMatchObject({
      message: 'Association already exists',
      code: 'CONFLICT',
    });
  });

  it('disassociate throws NOT_FOUND when link missing', async () => {
    const parentStudentRepo: IParentStudentRepository = {
      findByKey: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findByUserId: vi.fn(),
      findByStudentId: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const studentRepo = { findById: vi.fn(), findByCurp: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new ParentStudentService(parentStudentRepo, userRepo as any, studentRepo as any);
    await expect(service.disassociate(1, 10)).rejects.toMatchObject({
      message: 'Association not found',
      code: 'NOT_FOUND',
    });
  });

  it('findStudentsByUserId returns list of students', async () => {
    const userRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1 }),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn().mockResolvedValue(0),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const links = [
      { userId: 1, studentId: 10, student: { id: 10, fullName: 'S1', curp: 'C1', grade: '1st', status: 'active' } },
    ];
    const parentStudentRepo: IParentStudentRepository = {
      findByUserId: vi.fn().mockResolvedValue(links),
      findByKey: vi.fn(),
      save: vi.fn(),
      findByStudentId: vi.fn(),
      delete: vi.fn(),
    };
    const studentRepo = { findById: vi.fn(), findByCurp: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new ParentStudentService(parentStudentRepo, userRepo, studentRepo as any);
    const result = await service.findStudentsByUserId(1);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ studentId: 10, fullName: 'S1', curp: 'C1' });
  });

  it('findParentsByStudentId returns list of parents', async () => {
    const studentRepo: IStudentRepository = {
      findById: vi.fn().mockResolvedValue({ id: 10 }),
      findByCurp: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const links = [
      { userId: 1, studentId: 10, user: { id: 1, name: 'Parent', email: 'p@x.com' } },
    ];
    const parentStudentRepo: IParentStudentRepository = {
      findByStudentId: vi.fn().mockResolvedValue(links),
      findByKey: vi.fn(),
      save: vi.fn(),
      findByUserId: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), count: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new ParentStudentService(parentStudentRepo, userRepo as any, studentRepo);
    const result = await service.findParentsByStudentId(10);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ userId: 1, name: 'Parent', email: 'p@x.com' });
  });
});
