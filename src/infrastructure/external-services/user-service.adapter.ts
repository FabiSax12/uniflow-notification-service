import { UserServicePort } from "src/application/ports/user-service.port";
import { User } from "src/domain/entities/user";
import { Email } from "src/domain/value-objects/email";
import { UserId } from "src/domain/value-objects/user-id";

export class UserServiceAdapter implements UserServicePort {
  getUserById(userId: UserId): Promise<User> {
    return Promise.resolve(User.create({
      id: userId,
      email: new Email("vargasarayafabian11@gmail.com"),
      name: "Fabian Vargas",
      deviceTokens: [],
    }));
  }
}