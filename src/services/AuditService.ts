import type { IAuditLogRepository } from '../repositories/interfaces/IAuditLogRepository';
import { logger } from '../config';

export interface AuditEntry {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  ip?: string | null;
}

export class AuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.auditLogRepository.save({
        userId: entry.userId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        ip: entry.ip ?? null,
      });
    } catch (err) {
      logger.error({ err, ...entry }, 'Failed to write audit log');
    }
  }

  async findAll(options?: {
    page?: number; limit?: number;
    userId?: number; entityType?: string; action?: string;
  }) {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 50;
    const skip = (page - 1) * limit;
    const filters = { userId: options?.userId, entityType: options?.entityType, action: options?.action };

    const [data, total] = await Promise.all([
      this.auditLogRepository.findAll({ ...filters, skip, take: limit }),
      this.auditLogRepository.count(filters),
    ]);
    return { data, total, page, limit };
  }
}
