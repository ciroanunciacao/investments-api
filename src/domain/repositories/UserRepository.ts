import { User } from '../entities/User';

export interface UserRepository {
  get(id: string): Promise<User>
  getByUid(uid: string): Promise<User>
  create(entity: User): Promise<User>
  update(id: string, entity: Partial<User>): Promise<User>
}
