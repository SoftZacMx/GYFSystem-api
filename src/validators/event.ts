import { z } from 'zod';
import { createPaginationQuerySchema } from './pagination';

export const createEventBodySchema = z.object({
  title: z.string().min(1, 'title is required').max(255),
  description: z.string().max(5000).nullable().optional(),
  eventDate: z.coerce.date({ message: 'eventDate must be a valid date' }),
});

export const updateEventBodySchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).nullable().optional(),
  eventDate: z.coerce.date({ message: 'eventDate must be a valid date' }).optional(),
});

const EVENT_SORTABLE_FIELDS = ['id', 'title', 'eventDate', 'createdAt'] as const;

const paginationSchema = createPaginationQuerySchema(EVENT_SORTABLE_FIELDS);

export const eventQuerySchema = paginationSchema.extend({
  createdBy: z.coerce.number().int().positive().optional(),
}).transform((data) => ({
  ...data,
  order: data.order ?? 'desc',
}));

export type CreateEventBody = z.infer<typeof createEventBodySchema>;
export type UpdateEventBody = z.infer<typeof updateEventBodySchema>;
export type EventQuery = z.infer<typeof eventQuerySchema>;
