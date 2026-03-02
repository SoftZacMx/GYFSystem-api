import { z } from 'zod';

export const createUserBodySchema = z.object({
  name: z.string().min(1, 'name is required').max(255),
  email: z.string().min(1, 'email is required').email('invalid email format').max(255),
  password: z.string().min(6, 'password must be at least 6 characters').max(255),
  userTypeId: z.coerce.number().int().positive('userTypeId must be a positive integer'),
  roleId: z.coerce.number().int().positive('roleId must be a positive integer'),
  status: z.string().min(1, 'status is required').max(50),
});

export const updateUserBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email('invalid email format').max(255).optional(),
  password: z.string().min(6, 'password must be at least 6 characters').max(255).optional(),
  userTypeId: z.coerce.number().int().positive().optional(),
  roleId: z.coerce.number().int().positive().optional(),
  status: z.string().min(1).max(50).optional(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
