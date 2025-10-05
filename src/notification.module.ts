import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { NotificationTypeOrmEntity } from './infrastructure/persistence/entities/notification.typeorm-entity';
import { TypeOrmNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { AzureNotificationAdapter } from './infrastructure/external-services/azure-notification.adapter';
import { MockUserAdapter } from './infrastructure/external-services/mock-user.adapter';
import { NotificationController } from './infrastructure/web/notification.controller';

import { NotificationDomainService } from './domain/services/notification-domain.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetUserNotificationsUseCase } from './application/use-cases/get-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';
import { UserServiceAdapter } from './infrastructure/external-services/user-service.adapter';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([NotificationTypeOrmEntity]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationDomainService,
    {
      provide: 'INotificationRepository',
      useClass: TypeOrmNotificationRepository,
    },
    {
      provide: 'NotificationSenderPort',
      useClass: AzureNotificationAdapter,
    },
    {
      provide: 'UserServicePort',
      useClass: UserServiceAdapter,
    },
    CreateNotificationUseCase,
    GetUserNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    GetUnreadCountUseCase,
    DeleteNotificationUseCase,
  ],
  exports: [
    CreateNotificationUseCase,
    GetUserNotificationsUseCase,
    MarkNotificationAsReadUseCase,
    GetUnreadCountUseCase,
    DeleteNotificationUseCase,
  ],
})
export class NotificationModule { }
