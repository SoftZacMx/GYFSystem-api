import { DataSource } from 'typeorm';
import { UserType } from '../entities';
import type { IUserTypeRepository } from './interfaces/IUserTypeRepository';

export class UserTypeRepository implements IUserTypeRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: number): Promise<UserType | null> {
    return this.dataSource.getRepository(UserType).findOne({ where: { id } });
  }

  async findAll(): Promise<UserType[]> {
    return this.dataSource.getRepository(UserType).find({ order: { id: 'ASC' } });
  }

  async save(userType: Partial<UserType>): Promise<UserType> {
    return this.dataSource.getRepository(UserType).save(userType as UserType);
  }
}
