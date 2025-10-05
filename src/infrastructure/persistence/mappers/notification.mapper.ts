import { Notification } from '../../../domain/entities/notification';
import { NotificationId } from '../../../domain/value-objects/notification-id';
import { UserId } from '../../../domain/value-objects/user-id';
import { NotificationType } from '../../../domain/value-objects/notification-type';
import { Priority } from '../../../domain/value-objects/priority';
import { NotificationDocument } from '../schemas/notification.schema';

export class NotificationMapper {
  static toDomain(document: NotificationDocument): Notification {
    return Notification.fromPersistence({
      id: new NotificationId(String(document.id || document._id)),
      userId: new UserId(document.userId),
      title: document.title,
      message: document.message,
      type: NotificationType.fromString(document.type),
      priority: Priority.fromString(document.priority),
      isRead: document.isRead,
      createdAt: document.createdAt,
      readAt: document.readAt,
      taskId: document.taskId,
      subjectId: document.subjectId,
      actionUrl: document.actionUrl,
      scheduledFor: document.scheduledFor,
    });
  }

  static toMongo(notification: Notification): Partial<NotificationDocument> {
    const props = notification.toProps();

    return {
      _id: notification.getId().getValue(),
      userId: props.userId.getValue(),
      title: props.title,
      message: props.message,
      type: props.type.getValue(),
      priority: props.priority.getValue(),
      isRead: props.isRead,
      createdAt: props.createdAt,
      readAt: props.readAt,
      taskId: props.taskId,
      subjectId: props.subjectId,
      actionUrl: props.actionUrl,
      scheduledFor: props.scheduledFor,
    };
  }

  static toMongoUpdate(
    notification: Notification,
  ): Partial<NotificationDocument> {
    const props = notification.toProps();

    return {
      _id: notification.getId().getValue(),
      title: props.title,
      message: props.message,
      type: props.type.getValue(),
      priority: props.priority.getValue(),
      isRead: props.isRead,
      readAt: props.readAt,
      taskId: props.taskId,
      subjectId: props.subjectId,
      actionUrl: props.actionUrl,
      scheduledFor: props.scheduledFor,
    };
  }
}
