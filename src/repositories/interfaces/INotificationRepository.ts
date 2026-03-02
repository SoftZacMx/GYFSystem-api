import { Notification } from '../../entities';

export interface NotificationFindAllOptions {
  skip?: number;
  take?: number;
  sortBy?: 'id' | 'createdAt' | 'type' | 'isRead';
  order?: 'asc' | 'desc';
  userId?: number;
  isRead?: boolean;
  type?: string;
}

export interface INotificationRepository {
  findById(id: number): Promise<Notification | null>;
  findAll(options?: NotificationFindAllOptions): Promise<Notification[]>;
  count(filters?: { userId?: number; isRead?: boolean; type?: string }): Promise<number>;
  save(notification: Partial<Notification>): Promise<Notification>;
  markAsRead(id: number): Promise<void>;
  markAllAsReadByUser(userId: number): Promise<number>;
  delete(id: number): Promise<void>;
}
