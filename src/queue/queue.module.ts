// src/queue/queue.module.ts
import { Module } from '@nestjs/common';
import { AzureQueueService } from './azure-queue.service';
import { QueueProcessorService } from './queue-processor.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    NotificationsModule,
    EmailModule,
  ],
  providers: [AzureQueueService, QueueProcessorService],
  exports: [AzureQueueService],
})
export class QueueModule { }