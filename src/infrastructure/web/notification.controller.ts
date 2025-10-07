import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateNotificationUseCase,
  CreateNotificationCommand,
} from '../../application/use-cases/create-notification.use-case';
import {
  GetUserNotificationsUseCase,
  GetUserNotificationsQuery,
} from '../../application/use-cases/get-user-notifications.use-case';
import {
  MarkNotificationAsReadUseCase,
  MarkNotificationAsReadCommand,
} from '../../application/use-cases/mark-notification-as-read.use-case';
import {
  GetUnreadCountUseCase,
  GetUnreadCountQuery,
} from '../../application/use-cases/get-unread-count.use-case';
import {
  DeleteNotificationUseCase,
  DeleteNotificationCommand,
} from '../../application/use-cases/delete-notification.use-case';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Controller()
export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  @Post('notifications')
  async create(
    @Body(ValidationPipe) dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const command: CreateNotificationCommand = {
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type,
      priority: dto.priority,
      taskId: dto.taskId,
      subjectId: dto.subjectId,
      actionUrl: dto.actionUrl,
      scheduledFor: dto.scheduledFor,
    };

    const notification = await this.createNotificationUseCase.execute(command);

    return NotificationResponseDto.fromDomain(notification);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('isRead') isRead?: boolean,
  ) {
    const query: GetUserNotificationsQuery = {
      userId,
      limit: limit ? parseInt(limit.toString()) : undefined,
      offset: offset ? parseInt(offset.toString()) : undefined,
      isRead:
        isRead !== undefined
          ? typeof isRead === 'boolean'
            ? isRead
            : isRead === 'true'
          : undefined,
    };

    const result = await this.getUserNotificationsUseCase.execute(query);

    return {
      notifications: result.notifications.map((n) =>
        NotificationResponseDto.fromDomain(n),
      ),
      total: result.total,
      hasMore: result.hasMore,
    };
  }

  @Get('user/:userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    const query: GetUnreadCountQuery = { userId };
    return this.getUnreadCountUseCase.execute(query);
  }

  @Put('notifications/:id/mark-read')
  async markAsRead(@Param('id') id: string) {
    const command: MarkNotificationAsReadCommand = { notificationId: id };
    return this.markNotificationAsReadUseCase.execute(command);
  }

  @Delete('notifications/:id')
  async delete(@Param('id') id: string): Promise<void> {
    const command: DeleteNotificationCommand = { notificationId: id };
    await this.deleteNotificationUseCase.execute(command);
  }
}
