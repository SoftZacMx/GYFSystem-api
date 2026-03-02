import { User } from '../../entities';

export interface FindAllOptions {
  skip?: number;
  take?: number;
}

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findAll(options?: FindAllOptions): Promise<User[]>;
  count(): Promise<number>;
  findByEmail(email: string): Promise<User | null>;
  save(user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
}
