import { describe, it, expect, vi } from 'vitest';
import { NotificationService } from './NotificationService';
import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { MailService } from '../mail';

function notification(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    userId: 1,
    message: 'Hello',
    type: 'info',
    isRead: false,
    documentId: null,
    eventId: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('NotificationService', () => {
  const mailService = { sendNotificationEmail: vi.fn().mockResolvedValue(undefined) } as unknown as MailService;

  it('create saves and returns dto when user exists', async () => {
    const userRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue({ id: 1, name: 'User', email: 'u@x.com' }),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    const notificationRepo: INotificationRepository = {
      save: vi.fn().mockResolvedValue(notification({ id: 1 })),
      findById: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsReadByUser: vi.fn(),
      delete: vi.fn(),
    };
    const service = new NotificationService(notificationRepo, userRepo, mailService);
    const result = await service.create({
      userId: 1,
      message: 'Hello',
      type: 'info',
    });
    expect(result).toMatchObject({ id: 1, userId: 1, message: 'Hello', type: 'info' });
  });

  it('create throws NOT_FOUND when user missing', async () => {
    const userRepo: IUserRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByEmail: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
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
    const service = new NotificationService(notificationRepo, userRepo, mailService);
    await expect(
      service.create({ userId: 999, message: 'Hi', type: 'info' })
    ).rejects.toMatchObject({ message: 'Target user not found', code: 'NOT_FOUND' });
  });

  it('findById returns notification when found', async () => {
    const notificationRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(notification()),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsReadByUser: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new NotificationService(notificationRepo, userRepo as any, mailService);
    const result = await service.findById(1);
    expect(result).toMatchObject({ id: 1, message: 'Hello' });
  });

  it('findById throws NOT_FOUND when missing', async () => {
    const notificationRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsReadByUser: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new NotificationService(notificationRepo, userRepo as any, mailService);
    await expect(service.findById(999)).rejects.toMatchObject({
      message: 'Notification not found',
      code: 'NOT_FOUND',
    });
  });

  it('markAsRead updates and returns notification', async () => {
    const notificationRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(notification()),
      markAsRead: vi.fn().mockResolvedValue(undefined),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAllAsReadByUser: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new NotificationService(notificationRepo, userRepo as any, mailService);
    const result = await service.markAsRead(1);
    expect(result.isRead).toBe(true);
    expect(notificationRepo.markAsRead).toHaveBeenCalledWith(1);
  });

  it('markAllAsReadByUser returns updated count', async () => {
    const notificationRepo: INotificationRepository = {
      markAllAsReadByUser: vi.fn().mockResolvedValue(5),
      findById: vi.fn(),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAsRead: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new NotificationService(notificationRepo, userRepo as any, mailService);
    const result = await service.markAllAsReadByUser(1);
    expect(result).toEqual({ updated: 5 });
  });

  it('delete throws NOT_FOUND when missing', async () => {
    const notificationRepo: INotificationRepository = {
      findById: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
      findAll: vi.fn(),
      count: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsReadByUser: vi.fn(),
      delete: vi.fn(),
    };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), findAll: vi.fn(), save: vi.fn(), delete: vi.fn() };
    const service = new NotificationService(notificationRepo, userRepo as any, mailService);
    await expect(service.delete(999)).rejects.toMatchObject({
      message: 'Notification not found',
      code: 'NOT_FOUND',
    });
  });
});
