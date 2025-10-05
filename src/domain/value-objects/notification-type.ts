export enum NotificationTypeEnum {
  DEADLINE_REMINDER = 'deadline_reminder',
  EXAM_REMINDER = 'exam_reminder',
  TASK_CREATED = 'task_created',
  GRADE_POSTED = 'grade_posted',
}

export class NotificationType {
  constructor(private readonly value: NotificationTypeEnum) {}

  getValue(): NotificationTypeEnum {
    return this.value;
  }

  equals(other: NotificationType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  static fromString(value: string): NotificationType {
    const enumValue = Object.values(NotificationTypeEnum).find(
      (v: string) => v === value,
    );
    if (!enumValue) {
      throw new Error(`Invalid notification type: ${value}`);
    }
    return new NotificationType(enumValue);
  }
}
