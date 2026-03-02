import bcrypt from 'bcrypt';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { AuditService } from './AuditService';
import { signAccessToken } from '../config/jwt';
import { createAppError } from '../middlewares/global-error-handler';

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

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService,
  ) {}

  async login(email: string, password: string, ip?: string): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw createAppError('Invalid email or password', 'UNAUTHORIZED');
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
}
