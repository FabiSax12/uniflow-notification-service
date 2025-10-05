import { UserId } from '../value-objects/user-id';
import { Email } from '../value-objects/email';

export interface UserProps {
  id: UserId;
  email: Email;
  name: string;
  deviceTokens: string[];
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  getId(): UserId {
    return this.props.id;
  }

  getEmail(): Email {
    return this.props.email;
  }

  getName(): string {
    return this.props.name;
  }

  getDeviceTokens(): string[] {
    return [...this.props.deviceTokens];
  }

  addDeviceToken(token: string): void {
    if (!this.props.deviceTokens.includes(token)) {
      this.props.deviceTokens.push(token);
    }
  }

  removeDeviceToken(token: string): void {
    this.props.deviceTokens = this.props.deviceTokens.filter(
      (t) => t !== token,
    );
  }

  hasDeviceTokens(): boolean {
    return this.props.deviceTokens.length > 0;
  }

  toProps(): UserProps {
    return { ...this.props };
  }
}
