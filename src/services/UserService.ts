import bcrypt from 'bcrypt';
import type { IUserRepository } from '../repositories/interfaces/IUserRepository';
import type { AuditService } from './AuditService';
import type { CreateUserBody, UpdateUserBody } from '../validators/user';
import { createAppError } from '../middlewares/global-error-handler';

const BCRYPT_ROUNDS = 10;

export interface UserDto {
  id: number;
  name: string;
  email: string;
  userTypeId: number;
  roleId: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

function toDto(user: { id: number; name: string; email: string; userTypeId: number; roleId: number; status: string; createdAt: Date; updatedAt: Date }): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    userTypeId: user.userTypeId,
    roleId: user.roleId,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(body: CreateUserBody, performedBy?: number, ip?: string): Promise<UserDto> {
    const existing = await this.userRepository.findByEmail(body.email);
    if (existing) {
      throw createAppError('Email already registered', 'CONFLICT');
    }
    const hashedPassword = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const user = await this.userRepository.save({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      userTypeId: body.userTypeId,
      roleId: body.roleId,
      status: body.status,
      isAccountActivated: false,
    });
    this.auditService.log({ userId: performedBy, action: 'CREATE', entityType: 'user', entityId: user.id, ip });
    return toDto(user);
  }

  async findAll(options?: { skip?: number; take?: number }): Promise<UserDto[]> {
    const list = await this.userRepository.findAll(options);
    return list.map(toDto);
  }

  async findAllPaginated(options: { page: number; limit: number }): Promise<{ data: UserDto[]; total: number }> {
    const skip = (options.page - 1) * options.limit;
    const [data, total] = await Promise.all([
      this.userRepository.findAll({ skip, take: options.limit }),
      this.userRepository.count(),
    ]);
    return { data: data.map(toDto), total };
  }

  async findById(id: number): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw createAppError('User not found', 'NOT_FOUND');
    }
    return toDto(user);
  }

  async update(id: number, body: UpdateUserBody, performedBy?: number, ip?: string): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw createAppError('User not found', 'NOT_FOUND');
    }
    if (body.email !== undefined && body.email !== user.email) {
      const existing = await this.userRepository.findByEmail(body.email);
      if (existing) {
        throw createAppError('Email already registered', 'CONFLICT');
      }
    }
    const updates: Partial<typeof user> = { ...body };
    if (body.password !== undefined) {
      updates.password = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    }
    const updated = await this.userRepository.save({ id, ...updates });
    this.auditService.log({ userId: performedBy, action: 'UPDATE', entityType: 'user', entityId: id, ip });
    return toDto(updated);
  }

  async delete(id: number, performedBy?: number, ip?: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw createAppError('User not found', 'NOT_FOUND');
    }
    await this.userRepository.delete(id);
    this.auditService.log({ userId: performedBy, action: 'DELETE', entityType: 'user', entityId: id, ip });
  }
}
