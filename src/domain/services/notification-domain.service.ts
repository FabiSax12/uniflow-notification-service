import { Notification } from '../entities/notification';
import { UserId } from '../value-objects/user-id';
import { NotificationType } from '../value-objects/notification-type';
import { Priority } from '../value-objects/priority';

export interface CreateNotificationProps {
  userId: UserId;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  taskId?: string;
  subjectId?: string;
  actionUrl?: string;
  scheduledFor?: Date;
}

export class NotificationDomainService {
  createNotification(props: CreateNotificationProps): Notification {
    return Notification.create(props);
  }

  shouldSendImmediately(notification: Notification): boolean {
    return notification.shouldBeSentNow();
  }

  canMarkAsRead(notification: Notification): boolean {
    return !notification.isRead();
  }

  validateScheduledTime(scheduledFor: Date): void {
    const now = new Date();
    if (scheduledFor <= now) {
      throw new Error('Scheduled time must be in the future');
    }
  }
}
