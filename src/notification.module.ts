import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import {
  NotificationSchema,
  NotificationMongoSchema,
} from './infrastructure/persistence/schemas/notification.schema';
import { MongoNotificationRepository } from './infrastructure/persistence/mongodb-notification.repository';
import { AzureNotificationAdapter } from './infrastructure/external-services/azure-notification.adapter';
import { UserServiceAdapter } from './infrastructure/external-services/user-service.adapter';
import { NotificationController } from './infrastructure/web/notification.controller';

import { NotificationDomainService } from './domain/services/notification-domain.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetUserNotificationsUseCase } from './application/use-cases/get-user-notifications.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { GetUnreadCountUseCase } from './application/use-cases/get-unread-count.use-case';
import { DeleteNotificationUseCase } from './application/use-cases/delete-notification.use-case';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: NotificationSchema.name, schema: NotificationMongoSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationDomainService,
    {
      provide: 'INotificationRepository',
      useClass: MongoNotificationRepository,
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
export class NotificationModule {}
