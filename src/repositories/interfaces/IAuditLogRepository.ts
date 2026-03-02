import { AuditLog } from '../../entities';

export interface AuditLogFindAllOptions {
  skip?: number;
  take?: number;
  userId?: number;
  entityType?: string;
  action?: string;
}

export interface IAuditLogRepository {
  save(entry: Partial<AuditLog>): Promise<AuditLog>;
  findAll(options?: AuditLogFindAllOptions): Promise<AuditLog[]>;
  count(filters?: { userId?: number; entityType?: string; action?: string }): Promise<number>;
}
