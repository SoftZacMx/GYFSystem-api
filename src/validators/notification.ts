import { z } from 'zod';
import { createPaginationQuerySchema } from './pagination';

const NOTIFICATION_TYPES = ['info', 'warning', 'document', 'event'] as const;

export const createNotificationBodySchema = z.object({
  userId: z.number().int().positive('userId must be a positive integer'),
  message: z.string().min(1, 'message is required').max(5000),
  type: z.enum(NOTIFICATION_TYPES, { message: `type must be one of: ${NOTIFICATION_TYPES.join(', ')}` }),
  documentId: z.number().int().positive().nullable().optional(),
  eventId: z.number().int().positive().nullable().optional(),
});

const NOTIFICATION_SORTABLE_FIELDS = ['id', 'createdAt', 'type', 'isRead'] as const;

const paginationSchema = createPaginationQuerySchema(NOTIFICATION_SORTABLE_FIELDS);

export const notificationQuerySchema = paginationSchema.extend({
  userId: z.coerce.number().int().positive().optional(),
  isRead: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
}).transform((data) => ({
  ...data,
  order: data.order ?? 'desc',
}));

export type CreateNotificationBody = z.infer<typeof createNotificationBodySchema>;
export type NotificationQuery = z.infer<typeof notificationQuerySchema>;
