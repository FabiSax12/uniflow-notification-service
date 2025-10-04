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
import { EmailService } from 'src/email/email.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService
  ) { }

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

  @Put(':id/mark-read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // POST - Llamado por Azure Function
  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(dto);

    // Enviar email si es high priority
    if (dto.priority === 'high') {
      await this.emailService.sendNotificationEmail({
        ...notification,
        userEmail: dto.userEmail,
        userName: dto.userName
      });
    }

    return notification;
  }


  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('notificationId') notificationId: string) {
    await this.notificationsService.delete(notificationId);
  }
}