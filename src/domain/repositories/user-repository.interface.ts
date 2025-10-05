import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';

export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
}
