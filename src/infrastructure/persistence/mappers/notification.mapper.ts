import { Notification } from '../../../domain/entities/notification';
import { NotificationId } from '../../../domain/value-objects/notification-id';
import { UserId } from '../../../domain/value-objects/user-id';
import { NotificationType } from '../../../domain/value-objects/notification-type';
import { Priority } from '../../../domain/value-objects/priority';
import { NotificationTypeOrmEntity } from '../entities/notification.typeorm-entity';

export class NotificationMapper {
  static toDomain(entity: NotificationTypeOrmEntity): Notification {
    return Notification.fromPersistence({
      id: new NotificationId(entity.id),
      userId: new UserId(entity.userId),
      title: entity.title,
      message: entity.message,
      type: NotificationType.fromString(entity.type),
      priority: Priority.fromString(entity.priority),
      isRead: entity.isRead,
      createdAt: entity.createdAt,
      readAt: entity.readAt,
      taskId: entity.taskId,
      subjectId: entity.subjectId,
      actionUrl: entity.actionUrl,
      scheduledFor: entity.scheduledFor,
    });
  }

  static toTypeOrm(notification: Notification): NotificationTypeOrmEntity {
    const props = notification.toProps();
    const entity = new NotificationTypeOrmEntity();

    entity.id = props.id.getValue();
    entity.userId = props.userId.getValue();
    entity.title = props.title;
    entity.message = props.message;
    entity.type = props.type.getValue();
    entity.priority = props.priority.getValue();
    entity.isRead = props.isRead;
    entity.createdAt = props.createdAt;
    entity.readAt = props.readAt;
    entity.taskId = props.taskId;
    entity.subjectId = props.subjectId;
    entity.actionUrl = props.actionUrl;
    entity.scheduledFor = props.scheduledFor;

    return entity;
  }
}
