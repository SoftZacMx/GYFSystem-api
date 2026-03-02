import { z } from 'zod';
import { createPaginationQuerySchema } from './pagination';

const CURP_REGEX = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;

const curpField = z
  .string()
  .length(18, 'CURP must be exactly 18 characters')
  .toUpperCase()
  .refine((v) => CURP_REGEX.test(v), { message: 'Invalid CURP format' });

export const createStudentBodySchema = z.object({
  fullName: z.string().min(1, 'fullName is required').max(255),
  curp: curpField,
  grade: z.string().min(1, 'grade is required').max(50),
  status: z.string().min(1, 'status is required').max(50),
});

export const updateStudentBodySchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  curp: curpField.optional(),
  grade: z.string().min(1).max(50).optional(),
  status: z.string().min(1).max(50).optional(),
});

const STUDENT_SORTABLE_FIELDS = ['id', 'fullName', 'curp', 'grade', 'status', 'createdAt'] as const;

export const studentQuerySchema = createPaginationQuerySchema(STUDENT_SORTABLE_FIELDS);

export type CreateStudentBody = z.infer<typeof createStudentBodySchema>;
export type UpdateStudentBody = z.infer<typeof updateStudentBodySchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
