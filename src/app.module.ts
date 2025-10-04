import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NotificationsModule } from './notifications/notifications.module';
import { QueueModule } from './queue/queue.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [NotificationsModule, QueueModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
