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
