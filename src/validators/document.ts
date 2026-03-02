import { z } from 'zod';
import { createPaginationQuerySchema } from './pagination';

export const createDocumentBodySchema = z.object({
  studentId: z.coerce.number().int().positive('studentId must be a positive integer'),
  categoryId: z.coerce.number().int().positive('categoryId must be a positive integer'),
  fileUrl: z.string().min(1, 'fileUrl is required').max(500),
  signatureHash: z.string().max(255).nullable().optional(),
});

const DOCUMENT_SORTABLE_FIELDS = ['id', 'uploadedAt', 'studentId', 'categoryId'] as const;

const paginationSchema = createPaginationQuerySchema(DOCUMENT_SORTABLE_FIELDS);

export const documentQuerySchema = paginationSchema.extend({
  studentId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
}).transform((data) => ({
  ...data,
  order: data.order ?? 'desc',
}));

export type CreateDocumentBody = z.infer<typeof createDocumentBodySchema>;
export type DocumentQuery = z.infer<typeof documentQuerySchema>;
