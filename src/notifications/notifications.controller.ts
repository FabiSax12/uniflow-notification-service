import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get('user/:userId')
  async getUserNotifications(
    @Param('userId') userId: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.notificationsService.findByUser(userId, +limit, +offset);
  }

  @Get('user/:userId/unread-count')
  async getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Put('notifications/:id/mark-read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('notifications')
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.create(dto);
  }

  @Delete('notifications/:notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('notificationId') notificationId: string) {
    await this.notificationsService.delete(notificationId);
  }
}