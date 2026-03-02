import type { IEventRepository } from '../repositories/interfaces/IEventRepository';
import type { INotificationRepository } from '../repositories/interfaces/INotificationRepository';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { MailService } from '../mail';
import type { AuditService } from './AuditService';
import type { CreateEventBody, UpdateEventBody } from '../validators/event';
import { createAppError } from '../middlewares/global-error-handler';
import { logger } from '../config';

export interface EventDto {
  id: number;
  createdBy: number;
  title: string;
  description: string | null;
  eventDate: Date;
  createdAt: Date;
}

function toDto(e: {
  id: number; createdBy: number; title: string;
  description: string | null; eventDate: Date; createdAt: Date;
}): EventDto {
  return {
    id: e.id, createdBy: e.createdBy, title: e.title,
    description: e.description, eventDate: e.eventDate, createdAt: e.createdAt,
  };
}

export interface EventListOptions {
  page: number;
  limit: number;
  sortBy?: string;
  order: 'asc' | 'desc';
  createdBy?: number;
}

export interface EventListResult {
  data: EventDto[];
  total: number;
}

export class EventService {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
  ) {}

  async create(body: CreateEventBody, createdBy: number, ip?: string): Promise<EventDto> {
    const event = await this.eventRepository.save({
      title: body.title,
      description: body.description ?? null,
      eventDate: body.eventDate,
      createdBy,
    });
    const dto = toDto(event);
    this.auditService.log({ userId: createdBy, action: 'CREATE', entityType: 'event', entityId: dto.id, ip });

    this.notifyAllUsers(dto).catch((err) => {
      logger.error({ err, eventId: dto.id }, 'Failed to send event notifications');
    });

    return dto;
  }

  private async notifyAllUsers(event: EventDto): Promise<void> {
    const users = await this.userRepository.findAll();
    const eventDateFormatted = event.eventDate.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
    const message = `Nuevo evento: "${event.title}"${event.description ? ` — ${event.description}` : ''}. Fecha: ${eventDateFormatted}`;

    logger.info({ eventId: event.id, userCount: users.length }, 'Sending event notifications to all users');

    for (const user of users) {
      try {
        const notification = await this.notificationRepository.save({
          userId: user.id,
          message,
          type: 'event',
          eventId: event.id,
          documentId: null,
        });

        this.mailService.sendNotificationEmail(user.email, {
          recipientName: user.name,
          message,
          type: 'event',
          createdAt: notification.createdAt,
        }).catch((err) => {
          logger.error({ err, userId: user.id, email: user.email }, 'Failed to send event email');
        });
      } catch (err) {
        logger.error({ err, userId: user.id, eventId: event.id }, 'Failed to create event notification');
      }
    }
  }

  async findAll(options: EventListOptions): Promise<EventListResult> {
    const skip = (options.page - 1) * options.limit;
    const filters = { createdBy: options.createdBy };

    const [data, total] = await Promise.all([
      this.eventRepository.findAll({
        ...filters,
        skip,
        take: options.limit,
        sortBy: options.sortBy as any,
        order: options.order,
      }),
      this.eventRepository.count(filters),
    ]);
    return { data: data.map(toDto), total };
  }

  async findById(id: number): Promise<EventDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw createAppError('Event not found', 'NOT_FOUND');
    }
    return toDto(event);
  }

  async update(id: number, body: UpdateEventBody, performedBy?: number, ip?: string): Promise<EventDto> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw createAppError('Event not found', 'NOT_FOUND');
    }
    const updated = await this.eventRepository.save({ id, ...body });
    this.auditService.log({ userId: performedBy, action: 'UPDATE', entityType: 'event', entityId: id, ip });
    return toDto(updated);
  }

  async delete(id: number, performedBy?: number, ip?: string): Promise<void> {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw createAppError('Event not found', 'NOT_FOUND');
    }
    await this.eventRepository.delete(id);
    this.auditService.log({ userId: performedBy, action: 'DELETE', entityType: 'event', entityId: id, ip });
  }
}
