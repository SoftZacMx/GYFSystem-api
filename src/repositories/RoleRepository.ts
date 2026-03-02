import { DataSource } from 'typeorm';
import { Role } from '../entities';
import type { IRoleRepository } from './interfaces/IRoleRepository';

export class RoleRepository implements IRoleRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: number): Promise<Role | null> {
    return this.dataSource.getRepository(Role).findOne({ where: { id } });
  }

  async findAll(): Promise<Role[]> {
    return this.dataSource.getRepository(Role).find({ order: { id: 'ASC' } });
  }

  async save(role: Partial<Role>): Promise<Role> {
    return this.dataSource.getRepository(Role).save(role as Role);
  }
}
