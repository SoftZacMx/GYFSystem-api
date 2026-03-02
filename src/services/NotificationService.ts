import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { MailService } from '../mail';
import type { CreateNotificationBody } from '../validators/notification';
import { createAppError } from '../middlewares/global-error-handler';
import { logger } from '../config';

export interface NotificationDto {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  documentId: number | null;
  eventId: number | null;
  createdAt: Date;
}

function toDto(n: {
  id: number; userId: number; message: string; type: string;
  isRead: boolean; documentId: number | null; eventId: number | null; createdAt: Date;
}): NotificationDto {
  return {
    id: n.id, userId: n.userId, message: n.message, type: n.type,
    isRead: n.isRead, documentId: n.documentId, eventId: n.eventId, createdAt: n.createdAt,
  };
}

export interface NotificationListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order: 'asc' | 'desc';
  userId?: number;
  isRead?: boolean;
  type?: string;
}

export interface NotificationListResult {
  data: NotificationDto[];
  total: number;
}

export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailService: MailService,
  ) {}

  async create(body: CreateNotificationBody): Promise<NotificationDto> {
    const user = await this.userRepository.findById(body.userId);
    if (!user) {
      throw createAppError('Target user not found', 'NOT_FOUND');
    }

    const notification = await this.notificationRepository.save({
      userId: body.userId,
      message: body.message,
      type: body.type,
      documentId: body.documentId ?? null,
      eventId: body.eventId ?? null,
    });

    const dto = toDto(notification);

    this.mailService.sendNotificationEmail(user.email, {
      recipientName: user.name,
      message: dto.message,
      type: dto.type,
      createdAt: dto.createdAt,
    }).catch((err) => {
      logger.error({ err, userId: user.id, email: user.email }, 'Unhandled error sending notification email');
    });

    return dto;
  }

  async findAll(options: NotificationListOptions): Promise<NotificationListResult> {
    const skip = (options.page - 1) * options.limit;
    const filters = { userId: options.userId, isRead: options.isRead, type: options.type };

    const [data, total] = await Promise.all([
      this.notificationRepository.findAll({
        ...filters,
        skip,
        take: options.limit,
        sortBy: options.sortBy as any,
        order: options.order,
      }),
      this.notificationRepository.count(filters),
    ]);
    return { data: data.map(toDto), total };
  }

  async findById(id: number): Promise<NotificationDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw createAppError('Notification not found', 'NOT_FOUND');
    }
    return toDto(notification);
  }

  async markAsRead(id: number): Promise<NotificationDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw createAppError('Notification not found', 'NOT_FOUND');
    }
    await this.notificationRepository.markAsRead(id);
    return toDto({ ...notification, isRead: true });
  }

  async markAllAsReadByUser(userId: number): Promise<{ updated: number }> {
    const updated = await this.notificationRepository.markAllAsReadByUser(userId);
    return { updated };
  }

  async delete(id: number): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw createAppError('Notification not found', 'NOT_FOUND');
    }
    await this.notificationRepository.delete(id);
  }
}
