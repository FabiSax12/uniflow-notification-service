import { Notification } from '../../../domain/entities/notification';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who received the notification',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Title of the notification',
    example: 'Assignment Due Tomorrow',
  })
  title: string;

  @ApiProperty({
    description: 'Message content of the notification',
    example: 'Your mathematics assignment is due tomorrow at 11:59 PM',
  })
  message: string;

  @ApiProperty({
    description: 'Type of notification',
    enum: [
      'deadline_reminder',
      'exam_reminder',
      'task_created',
      'grade_posted',
    ],
    example: 'deadline_reminder',
  })
  type: string;

  @ApiProperty({
    description: 'Priority level of the notification',
    enum: ['high', 'medium', 'low'],
    example: 'high',
  })
  priority: string;

  @ApiProperty({
    description: 'Whether the notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Date and time when the notification was created',
    example: '2025-10-06T08:30:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Date and time when the notification was read',
    example: '2025-10-06T09:15:00Z',
  })
  readAt?: Date;

  @ApiPropertyOptional({
    description: 'Task ID associated with the notification',
    example: 'task-456',
  })
  taskId?: string;

  @ApiPropertyOptional({
    description: 'Subject/course ID associated with the notification',
    example: 'course-789',
  })
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'URL for the user to take action',
    example: 'https://app.example.com/assignments/123',
  })
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Scheduled date/time for the notification',
    example: '2025-10-07T10:00:00Z',
  })
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
