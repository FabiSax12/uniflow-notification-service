import { Notification } from '../../../domain/entities/notification';

export class NotificationResponseDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  taskId?: string;
  subjectId?: string;
  actionUrl?: string;
  scheduledFor?: Date;

  static fromDomain(notification: Notification): NotificationResponseDto {
    const dto = new NotificationResponseDto();

    dto.id = notification.getId().getValue();
    dto.userId = notification.getUserId().getValue();
    dto.title = notification.getTitle();
    dto.message = notification.getMessage();
    dto.type = notification.getType().getValue();
    dto.priority = notification.getPriority().getValue();
    dto.isRead = notification.isRead();
    dto.createdAt = notification.getCreatedAt();
    dto.readAt = notification.getReadAt();
    dto.taskId = notification.getTaskId();
    dto.subjectId = notification.getSubjectId();
    dto.actionUrl = notification.getActionUrl();
    dto.scheduledFor = notification.getScheduledFor();

    return dto;
  }
}
