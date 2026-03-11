import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from '../services/AuthService';
import { success } from '../views';
import {
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} from '../validators';
import type { VerifyAccountQuery } from '../validators';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }

    const { email, password } = parsed.data;

    try {
      const ip = req.ip ?? req.socket.remoteAddress ?? null;
      const result = await this.authService.login(email, password, ip ?? undefined);
      success(res, result, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Returns the current user from the token (req.user set by authMiddleware).
   * Must be used on routes protected by authMiddleware.
   */
  me(req: Request, res: Response): void {
    if (!req.user) {
      return;
    }
    success(res, req.user, undefined, 200);
  }

  /**
   * Verifies account using the token from the verification email link.
   * Token is validated via validateQuery(verifyAccountQuerySchema); use req.validatedQuery.
   */
  async verifyAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    const query = req.validatedQuery as VerifyAccountQuery | undefined;
    if (!query?.token) {
      next(new Error('Token is required'));
      return;
    }
    try {
      await this.authService.verifyAccount(query.token);
      success(res, { message: 'Account verified successfully' }, undefined, 200);
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = forgotPasswordBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    try {
      await this.authService.forgotPassword(parsed.data.email);
      success(
        res,
        { message: 'If an account exists with this email, you will receive a reset link.' },
        undefined,
        200
      );
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    const parsed = resetPasswordBodySchema.safeParse(req.body);
    if (!parsed.success) {
      next(parsed.error);
      return;
    }
    try {
      await this.authService.resetPassword(parsed.data.token, parsed.data.newPassword);
      success(res, { message: 'Password has been reset successfully.' }, undefined, 200);
    } catch (err) {
      next(err);
    }
  }
}
