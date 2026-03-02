import { Event } from '../../entities';

export interface EventFindAllOptions {
  skip?: number;
  take?: number;
  sortBy?: 'id' | 'title' | 'eventDate' | 'createdAt';
  order?: 'asc' | 'desc';
  createdBy?: number;
}

export interface IEventRepository {
  findById(id: number): Promise<Event | null>;
  findAll(options?: EventFindAllOptions): Promise<Event[]>;
  count(filters?: { createdBy?: number }): Promise<number>;
  save(event: Partial<Event>): Promise<Event>;
  delete(id: number): Promise<void>;
}
