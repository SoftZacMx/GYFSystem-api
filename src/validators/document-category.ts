import { z } from 'zod';

export const createDocumentCategoryBodySchema = z.object({
  name: z.string().min(1, 'name is required').max(255),
  description: z.string().max(1000).nullable().optional(),
});

export const updateDocumentCategoryBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
});

export type CreateDocumentCategoryBody = z.infer<typeof createDocumentCategoryBodySchema>;
export type UpdateDocumentCategoryBody = z.infer<typeof updateDocumentCategoryBodySchema>;
