import { Notification } from '../../domain/entities/notification';
import { User } from '../../domain/entities/user';

export interface NotificationSenderPort {
  sendPushNotification(
    user: User,
    notification: Notification,
  ): Promise<boolean>;
  sendEmailNotification(
    user: User,
    notification: Notification,
  ): Promise<boolean>;
}
