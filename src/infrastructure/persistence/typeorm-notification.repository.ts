import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  INotificationRepository,
  NotificationQueryOptions,
  NotificationQueryResult,
} from '../../domain/repositories/notification-repository.interface';
import { Notification } from '../../domain/entities/notification';
import { NotificationId } from '../../domain/value-objects/notification-id';
import { UserId } from '../../domain/value-objects/user-id';
import { NotificationTypeOrmEntity } from './entities/notification.typeorm-entity';
import { NotificationMapper } from './mappers/notification.mapper';

@Injectable()
export class TypeOrmNotificationRepository implements INotificationRepository {
  constructor(
    @InjectRepository(NotificationTypeOrmEntity)
    private readonly repository: Repository<NotificationTypeOrmEntity>,
  ) {}

  async save(notification: Notification): Promise<Notification> {
    const entity = NotificationMapper.toTypeOrm(notification);
    const savedEntity = await this.repository.save(entity);
    return NotificationMapper.toDomain(savedEntity);
  }

  async findById(id: NotificationId): Promise<Notification | null> {
    const entity = await this.repository.findOne({
      where: { id: id.getValue() },
    });

    return entity ? NotificationMapper.toDomain(entity) : null;
  }

  async findByUserId(
    userId: UserId,
    options: NotificationQueryOptions = {},
  ): Promise<NotificationQueryResult> {
    const { limit = 20, offset = 0, isRead } = options;

    const queryBuilder = this.repository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId: userId.getValue() })
      .orderBy('notification.createdAt', 'DESC');

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    const [entities, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    const notifications = entities.map((entity) =>
      NotificationMapper.toDomain(entity),
    );

    return {
      notifications,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getUnreadCount(userId: UserId): Promise<number> {
    return this.repository.count({
      where: {
        userId: userId.getValue(),
        isRead: false,
      },
    });
  }

  async delete(id: NotificationId): Promise<void> {
    const result = await this.repository.delete(id.getValue());
    if (result.affected === 0) {
      throw new Error('Notification not found');
    }
  }

  async findScheduledNotifications(before: Date): Promise<Notification[]> {
    const entities = await this.repository.find({
      where: {
        scheduledFor: before,
        isRead: false,
      },
    });

    return entities.map((entity) => NotificationMapper.toDomain(entity));
  }
}
