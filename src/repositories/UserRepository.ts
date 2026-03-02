import { DataSource } from 'typeorm';
import { User } from '../entities';
import type { IUserRepository, FindAllOptions } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findById(id: number): Promise<User | null> {
    return this.dataSource.getRepository(User).findOne({ where: { id } });
  }

  async findAll(options?: FindAllOptions): Promise<User[]> {
    const repo = this.dataSource.getRepository(User);
    return repo.find({
      skip: options?.skip,
      take: options?.take,
      order: { id: 'ASC' },
    });
  }

  async count(): Promise<number> {
    return this.dataSource.getRepository(User).count();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.dataSource.getRepository(User).findOne({ where: { email } });
  }

  async save(user: Partial<User>): Promise<User> {
    return this.dataSource.getRepository(User).save(user as User);
  }

  async delete(id: number): Promise<void> {
    await this.dataSource.getRepository(User).delete(id);
  }
}
