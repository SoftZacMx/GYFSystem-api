import jwt from 'jsonwebtoken';
import { env } from './env';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  roleId: number;
  iat?: number;
  exp?: number;
}

const DEFAULT_EXPIRES_IN_SECONDS = 3600; // 1 hour

/**
 * Generates a signed JWT access token with payload sub, email, roleId and exp.
 */
export function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
  options?: { expiresIn?: number }
): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: options?.expiresIn ?? DEFAULT_EXPIRES_IN_SECONDS,
  });
}

/**
 * Verifies the token signature and expiration. Returns the decoded payload or throws.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null || !('sub' in decoded)) {
    throw new Error('Invalid token payload');
  }
  const payload = decoded as jwt.JwtPayload & AccessTokenPayload;
  return {
    sub: payload.sub as number,
    email: payload.email as string,
    roleId: payload.roleId as number,
    iat: payload.iat,
    exp: payload.exp,
  };
}

// --- Account verification token (1 hour, purpose: account_verify) ---

export interface VerificationTokenPayload {
  userId: number;
  email: string;
  purpose: 'account_verify';
  iat?: number;
  exp?: number;
}

const VERIFICATION_TOKEN_EXPIRES_IN_SECONDS = 3600; // 1 hour

/**
 * Signs a JWT for account verification. Payload: userId, email, purpose: 'account_verify'. Expires in 1 hour.
 */
export function signVerificationToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email, purpose: 'account_verify' as const },
    env.JWT_SECRET,
    { expiresIn: VERIFICATION_TOKEN_EXPIRES_IN_SECONDS }
  );
}

/**
 * Verifies the verification token. Returns the decoded payload or throws.
 */
export function verifyVerificationToken(token: string): VerificationTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null || !('userId' in decoded) || (decoded as { purpose?: string }).purpose !== 'account_verify') {
    throw new Error('Invalid verification token');
  }
  const payload = decoded as jwt.JwtPayload & VerificationTokenPayload;
  return {
    userId: payload.userId as number,
    email: payload.email as string,
    purpose: 'account_verify',
    iat: payload.iat,
    exp: payload.exp,
  };
}

// --- Password reset token (1 hour, purpose: password_reset) ---

export interface PasswordResetTokenPayload {
  userId: number;
  email: string;
  purpose: 'password_reset';
  iat?: number;
  exp?: number;
}

const PASSWORD_RESET_TOKEN_EXPIRES_IN_SECONDS = 3600; // 1 hour

export function signPasswordResetToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email, purpose: 'password_reset' as const },
    env.JWT_SECRET,
    { expiresIn: PASSWORD_RESET_TOKEN_EXPIRES_IN_SECONDS }
  );
}

export function verifyPasswordResetToken(token: string): PasswordResetTokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== 'object' || decoded === null || !('userId' in decoded) || (decoded as { purpose?: string }).purpose !== 'password_reset') {
    throw new Error('Invalid password reset token');
  }
  const payload = decoded as jwt.JwtPayload & PasswordResetTokenPayload;
  return {
    userId: payload.userId as number,
    email: payload.email as string,
    purpose: 'password_reset',
    iat: payload.iat,
    exp: payload.exp,
  };
}
