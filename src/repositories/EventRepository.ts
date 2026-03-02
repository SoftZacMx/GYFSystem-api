import { DataSource, type FindOptionsWhere } from 'typeorm';
import { Event } from '../entities';
import type { IEventRepository, EventFindAllOptions } from './interfaces/IEventRepository';

export class EventRepository implements IEventRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(Event);
  }

  async findById(id: number): Promise<Event | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(options?: EventFindAllOptions): Promise<Event[]> {
    const where = this.buildWhere(options);
    const sortField = options?.sortBy ?? 'eventDate';
    const sortOrder = (options?.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC';

    return this.repo.find({
      where,
      skip: options?.skip,
      take: options?.take,
      order: { [sortField]: sortOrder },
    });
  }

  async count(filters?: { createdBy?: number }): Promise<number> {
    const where = this.buildWhere(filters);
    return this.repo.count({ where });
  }

  async save(event: Partial<Event>): Promise<Event> {
    return this.repo.save(event as Event);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  private buildWhere(filters?: { createdBy?: number }): FindOptionsWhere<Event> {
    const where: FindOptionsWhere<Event> = {};
    if (filters?.createdBy !== undefined) where.createdBy = filters.createdBy;
    return where;
  }
}
