import { NotificationId } from '../value-objects/notification-id';
import { UserId } from '../value-objects/user-id';
import { NotificationType } from '../value-objects/notification-type';
import { Priority } from '../value-objects/priority';

export interface NotificationProps {
  id: NotificationId;
  userId: UserId;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  taskId?: string;
  subjectId?: string;
  actionUrl?: string;
  scheduledFor?: Date;
}

export class Notification {
  private constructor(private props: NotificationProps) {}

  static create(
    props: Omit<NotificationProps, 'id' | 'createdAt' | 'isRead'>,
  ): Notification {
    const notificationProps: NotificationProps = {
      ...props,
      id: new NotificationId(crypto.randomUUID()),
      createdAt: new Date(),
      isRead: false,
    };

    return new Notification(notificationProps);
  }

  static fromPersistence(props: NotificationProps): Notification {
    return new Notification(props);
  }

  getId(): NotificationId {
    return this.props.id;
  }

  getUserId(): UserId {
    return this.props.userId;
  }

  getTitle(): string {
    return this.props.title;
  }

  getMessage(): string {
    return this.props.message;
  }

  getType(): NotificationType {
    return this.props.type;
  }

  getPriority(): Priority {
    return this.props.priority;
  }

  isRead(): boolean {
    return this.props.isRead;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getReadAt(): Date | undefined {
    return this.props.readAt;
  }

  getTaskId(): string | undefined {
    return this.props.taskId;
  }

  getSubjectId(): string | undefined {
    return this.props.subjectId;
  }

  getActionUrl(): string | undefined {
    return this.props.actionUrl;
  }

  getScheduledFor(): Date | undefined {
    return this.props.scheduledFor;
  }

  markAsRead(): void {
    if (this.props.isRead) {
      throw new Error('Notification is already marked as read');
    }
    this.props.isRead = true;
    this.props.readAt = new Date();
  }

  isScheduled(): boolean {
    return this.props.scheduledFor !== undefined;
  }

  shouldBeSentNow(): boolean {
    if (!this.isScheduled()) {
      return true;
    }
    return new Date() >= this.props.scheduledFor!;
  }

  toProps(): NotificationProps {
    return { ...this.props };
  }
}
