import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PushNotificationService } from './push-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private pushNotificationService: PushNotificationService,
  ) { }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      ...dto,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : undefined,
    });

    const savedNotification = await this.notificationsRepository.save(notification);

    await this.pushNotificationService.sendToUser(dto.userId, savedNotification);

    return savedNotification;
  }

  async findByUser(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    const [notifications, total] = await this.notificationsRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      notifications,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getUnreadCount(userId: string) {
    const unreadCount = await this.notificationsRepository.count({
      where: { userId, isRead: false },
    });

    return {
      userId,
      unreadCount,
      lastChecked: new Date(),
    };
  }

  async markAsRead(id: string) {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();

    await this.notificationsRepository.save(notification);

    return {
      id: notification.id,
      isRead: true,
      markedAt: notification.readAt,
      success: true,
    };
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationsRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Notification not found');
    }
  }
}