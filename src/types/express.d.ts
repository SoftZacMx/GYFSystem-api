import type { AccessTokenPayload } from '../config/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
      validatedQuery?: unknown;
    }
  }
}

export {};
