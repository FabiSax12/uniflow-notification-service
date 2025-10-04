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
}

export class NotificationsListDto {
  notifications: NotificationResponseDto[];
  total: number;
  hasMore: boolean;
}

export class UnreadCountDto {
  userId: string;
  unreadCount: number;
  lastChecked: Date;
}