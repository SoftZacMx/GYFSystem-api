import { DataSource, type FindOptionsWhere } from 'typeorm';
import { AuditLog } from '../entities';
import type { IAuditLogRepository, AuditLogFindAllOptions } from './interfaces/IAuditLogRepository';

export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly dataSource: DataSource) {}

  private get repo() {
    return this.dataSource.getRepository(AuditLog);
  }

  async save(entry: Partial<AuditLog>): Promise<AuditLog> {
    return this.repo.save(entry as AuditLog);
  }

  async findAll(options?: AuditLogFindAllOptions): Promise<AuditLog[]> {
    const where = this.buildWhere(options);
    return this.repo.find({
      where,
      skip: options?.skip,
      take: options?.take,
      order: { createdAt: 'DESC' },
    });
  }

  async count(filters?: { userId?: number; entityType?: string; action?: string }): Promise<number> {
    const where = this.buildWhere(filters);
    return this.repo.count({ where });
  }

  private buildWhere(filters?: { userId?: number; entityType?: string; action?: string }): FindOptionsWhere<AuditLog> {
    const where: FindOptionsWhere<AuditLog> = {};
    if (filters?.userId !== undefined) where.userId = filters.userId;
    if (filters?.entityType !== undefined) where.entityType = filters.entityType;
    if (filters?.action !== undefined) where.action = filters.action;
    return where;
  }
}
