import type { IUserTypeRepository } from '../repositories/interfaces/IUserTypeRepository';
import { createAppError } from '../middlewares/global-error-handler';

export class UserTypeService {
  constructor(private readonly userTypeRepository: IUserTypeRepository) {}

  async findAll(): Promise<{ id: number; name: string }[]> {
    const list = await this.userTypeRepository.findAll();
    return list.map((e) => ({ id: e.id, name: e.name }));
  }

  async findById(id: number): Promise<{ id: number; name: string }> {
    const entity = await this.userTypeRepository.findById(id);
    if (!entity) {
      throw createAppError('User type not found', 'NOT_FOUND');
    }
    return { id: entity.id, name: entity.name };
  }
}
