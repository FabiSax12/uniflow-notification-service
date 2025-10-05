export class NotificationId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('NotificationId cannot be empty');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: NotificationId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
