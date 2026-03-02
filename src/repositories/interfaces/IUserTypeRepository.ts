import { UserType } from '../../entities';

export interface IUserTypeRepository {
  findById(id: number): Promise<UserType | null>;
  findAll(): Promise<UserType[]>;
  save(userType: Partial<UserType>): Promise<UserType>;
}
