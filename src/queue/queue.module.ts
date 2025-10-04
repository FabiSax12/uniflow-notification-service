import { Module } from '@nestjs/common';
import { AzureQueueService } from './azure-queue/azure-queue.service';

@Module({
  providers: [AzureQueueService]
})
export class QueueModule {}
