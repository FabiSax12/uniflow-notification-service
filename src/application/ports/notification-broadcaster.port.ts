import { Notification } from '../../domain/entities/notification';

export interface NotificationBroadcasterPort {
  broadcastToUser(userId: string, notification: Notification): Promise<void>;
  broadcastToAll(notification: Notification): Promise<void>;
}
