import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';

export interface UserServicePort {
  getUserById(userId: UserId): Promise<User>;
}
