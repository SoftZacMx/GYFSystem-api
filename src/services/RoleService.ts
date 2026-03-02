import type { IRoleRepository } from '../repositories/interfaces/IRoleRepository';
import { createAppError } from '../middlewares/global-error-handler';

export class RoleService {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async findAll(): Promise<{ id: number; name: string }[]> {
    const list = await this.roleRepository.findAll();
    return list.map((e) => ({ id: e.id, name: e.name }));
  }

  async findById(id: number): Promise<{ id: number; name: string }> {
    const entity = await this.roleRepository.findById(id);
    if (!entity) {
      throw createAppError('Role not found', 'NOT_FOUND');
    }
    return { id: entity.id, name: entity.name };
  }
}
