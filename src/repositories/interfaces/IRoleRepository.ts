import { Role } from '../../entities';

export interface IRoleRepository {
  findById(id: number): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Partial<Role>): Promise<Role>;
}
