import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().min(1, 'email is required').email('invalid email format'),
  password: z.string().min(1, 'password is required'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export const verifyAccountQuerySchema = z.object({
  token: z.string().min(1, 'token is required'),
});

export type VerifyAccountQuery = z.infer<typeof verifyAccountQuerySchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().min(1, 'email is required').email('invalid email format'),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'token is required'),
  newPassword: z.string().min(6, 'password must be at least 6 characters').max(255),
});

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
