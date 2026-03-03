import bcrypt from 'bcrypt';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { AuditService } from './AuditService';
import type { MailService } from '../mail/MailService';
import { signAccessToken, signVerificationToken, verifyVerificationToken } from '../config/jwt';
import { createAppError } from '../middlewares/global-error-handler';
import { env } from '../config/env';

export interface LoginResult {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    roleId: number;
    userTypeId: number;
    status: string;
  };
}

const VERIFICATION_LINK_GENERIC_ERROR = 'Invalid or expired verification link';

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
  ) {}

  async login(email: string, password: string, ip?: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw createAppError('Invalid email or password', 'UNAUTHORIZED');
    }

    if (!user.isAccountActivated) {
      throw createAppError(
        'Account not verified. Please check your email for the verification link.',
        'UNPROCESSABLE_ENTITY'
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw createAppError('Invalid email or password', 'UNAUTHORIZED');
    }

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    });

    this.auditService.log({ userId: user.id, action: 'LOGIN', entityType: 'user', entityId: user.id, ip });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        userTypeId: user.userTypeId,
        status: user.status,
      },
    };
  }

  /**
   * Generates a verification token and sends the verification email to the user.
   * Used after user registration. Does not throw on mail failure; caller may log.
   */
  async sendVerificationEmail(userId: number, email: string, recipientName: string): Promise<void> {
    const token = signVerificationToken(userId, email);
    const verificationUrl = `${env.APP_URL}/auth/account/verify?token=${encodeURIComponent(token)}`;
    await this.mailService.sendVerificationEmail(email, {
      recipientName,
      verificationUrl,
    });
  }

  /**
   * Verifies the token, ensures user exists and is not yet activated, then sets isAccountActivated and sends confirmation email.
   * Throws a generic error (no user enumeration) if token is invalid, user not found, or already activated.
   */
  async verifyAccount(token: string): Promise<void> {
    let payload: { userId: number; email: string };
    try {
      payload = verifyVerificationToken(token);
    } catch {
      throw createAppError(VERIFICATION_LINK_GENERIC_ERROR, 'BAD_REQUEST');
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user || user.email !== payload.email) {
      throw createAppError(VERIFICATION_LINK_GENERIC_ERROR, 'BAD_REQUEST');
    }
    if (user.isAccountActivated) {
      throw createAppError(VERIFICATION_LINK_GENERIC_ERROR, 'BAD_REQUEST');
    }

    const now = new Date();
    await this.userRepository.save({
      id: user.id,
      isAccountActivated: true,
      emailVerifiedAt: now,
    });

    try {
      await this.mailService.sendAccountActivatedEmail(user.email, {
        recipientName: user.name,
      });
    } catch {
      // User is already activated; log is handled in MailService. Still return success.
    }
  }
}
