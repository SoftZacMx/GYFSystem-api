import { z } from 'zod';

export const uploadDocumentFieldsSchema = z.object({
  studentId: z.coerce.number().int().positive('studentId must be a positive integer'),
  categoryId: z.coerce.number().int().positive('categoryId must be a positive integer'),
  sign: z.enum(['true', 'false']).transform((v) => v === 'true').optional().default(false),
});

export type UploadDocumentFields = z.infer<typeof uploadDocumentFieldsSchema>;
