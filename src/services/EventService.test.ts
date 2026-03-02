import { describe, it, expect, vi } from 'vitest';
import { EventService } from './EventService';
import type { IEventRepository } from '../repositories/interfaces/IEventRepository';
import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { MailService } from '../mail';
import type { AuditService } from './AuditService';

function event(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    createdBy: 1,
    title: 'Meeting',
    description: 'Team sync',
    eventDate: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
}

describe('EventService', () => {
  const auditService = { log: vi.fn().mockResolvedValue(undefined) } as unknown as AuditService;
  const mailService = { sendNotificationEmail: vi.fn() } as unknown as MailService;

  it('create saves event and returns dto', async () => {
    const eventRepo: IEventRepository = {
      save: vi.fn().mockResolvedValue(event({ id: 1, title: 'New' })),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const notificationRepo: INotificationRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsReadByUser: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo: IUserRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const service = new EventService(
      eventRepo,
      notificationRepo,
      userRepo,
      mailService,
      auditService
    );
    const result = await service.create(
      { title: 'New', description: 'Desc', eventDate: new Date() },
      1
    );
    expect(result).toMatchObject({ id: 1, title: 'New', createdBy: 1 });
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', entityType: 'event', entityId: 1 })
    );
  });

  it('findById returns event when found', async () => {
    const eventRepo: IEventRepository = {
      findById: vi.fn().mockResolvedValue(event()),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const notificationRepo = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), count: vi.fn(), markAsRead: vi.fn(), markAllAsReadByUser: vi.fn(), delete: vi.fn() };
    const userRepo = { findAll: vi.fn(), findById: vi.fn(), findByEmail: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new EventService(
      eventRepo,
      notificationRepo as any,
      userRepo as any,
      mailService,
      auditService
    );
    const result = await service.findById(1);
    expect(result).toMatchObject({ id: 1, title: 'Meeting' });
  });

  it('findById throws NOT_FOUND when missing', async () => {
    const eventRepo: IEventRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const notificationRepo = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), count: vi.fn(), markAsRead: vi.fn(), markAllAsReadByUser: vi.fn(), delete: vi.fn() };
    const userRepo = { findAll: vi.fn(), findById: vi.fn(), findByEmail: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new EventService(
      eventRepo,
      notificationRepo as any,
      userRepo as any,
      mailService,
      auditService
    );
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'Event not found',
      code: 'NOT_FOUND',
    });
  });

  it('findAll returns data and total', async () => {
    const eventRepo: IEventRepository = {
      findAll: vi.fn().mockResolvedValue([event()]),
      count: vi.fn().mockResolvedValue(1),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const notificationRepo = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), count: vi.fn(), markAsRead: vi.fn(), markAllAsReadByUser: vi.fn(), delete: vi.fn() };
    const userRepo = { findAll: vi.fn(), findById: vi.fn(), findByEmail: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new EventService(
      eventRepo,
      notificationRepo as any,
      userRepo as any,
      mailService,
      auditService
    );
    const result = await service.findAll({ page: 1, limit: 10, order: 'asc' });
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('update throws NOT_FOUND when event missing', async () => {
    const eventRepo: IEventRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    };
    const notificationRepo = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), count: vi.fn(), markAsRead: vi.fn(), markAllAsReadByUser: vi.fn(), delete: vi.fn() };
    const userRepo = { findAll: vi.fn(), findById: vi.fn(), findByEmail: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new EventService(
      eventRepo,
      notificationRepo as any,
      userRepo as any,
      mailService,
      auditService
    );
    await expect(service.update(999, { title: 'X' })).rejects.toMatchObject({
      message: 'Event not found',
      code: 'NOT_FOUND',
    });
  });

  it('delete deletes and audits', async () => {
    const eventRepo: IEventRepository = {
      findById: vi.fn().mockResolvedValue(event()),
      delete: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
    };
    const notificationRepo = { save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), count: vi.fn(), markAsRead: vi.fn(), markAllAsReadByUser: vi.fn(), delete: vi.fn() };
    const userRepo = { findAll: vi.fn(), findById: vi.fn(), findByEmail: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new EventService(
      eventRepo,
      notificationRepo as any,
      userRepo as any,
      mailService,
      auditService
    );
    await service.delete(1);
    expect(eventRepo.delete).toHaveBeenCalledWith(1);
    expect(auditService.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE', entityType: 'event', entityId: 1 })
    );
  });
});
