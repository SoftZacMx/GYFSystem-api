import { DataSource, type FindOptionsWhere } from 'typeorm';
import { Notification } from '../entities';
import type { INotificationRepository, NotificationFindAllOptions } from './interfaces/INotificationRepository';

export class NotificationRepository implements INotificationRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(Notification);
  }

  async findById(id: number): Promise<Notification | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(options?: NotificationFindAllOptions): Promise<Notification[]> {
    const where = this.buildWhere(options);
    const sortField = options?.sortBy ?? 'createdAt';
    const sortOrder = (options?.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';

    return this.repo.find({
      where,
      skip: options?.skip,
      take: options?.take,
      order: { [sortField]: sortOrder },
    });
  }

  async count(filters?: { userId?: number; isRead?: boolean; type?: string }): Promise<number> {
    const where = this.buildWhere(filters);
    return this.repo.count({ where });
  }

  async save(notification: Partial<Notification>): Promise<Notification> {
    return this.repo.save(notification as Notification);
  }

  async markAsRead(id: number): Promise<void> {
    await this.repo.update(id, { isRead: true });
  }

  async markAllAsReadByUser(userId: number): Promise<number> {
    const result = await this.repo.update({ userId, isRead: false }, { isRead: true });
    return result.affected ?? 0;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private buildWhere(filters?: { userId?: number; isRead?: boolean; type?: string }): FindOptionsWhere<Notification> {
    const where: FindOptionsWhere<Notification> = {};
    if (filters?.userId !== undefined) where.userId = filters.userId;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;
    if (filters?.type !== undefined) where.type = filters.type;
    return where;
  }
}
