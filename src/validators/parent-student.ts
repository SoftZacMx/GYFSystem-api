import { z } from 'zod';

export const parentStudentBodySchema = z.object({
  userId: z.coerce.number().int().positive('userId must be a positive integer'),
  studentId: z.coerce.number().int().positive('studentId must be a positive integer'),
});

export type ParentStudentBody = z.infer<typeof parentStudentBodySchema>;
