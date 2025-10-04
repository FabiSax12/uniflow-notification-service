import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendNotificationEmail(notification: any) {
    // Por ahora solo loguear, luego implementaremos Azure Communication
    this.logger.log(`📧 [MOCK] Sending email for notification: ${notification.id}`);
    this.logger.log(`   To user: ${notification.userId}`);
    this.logger.log(`   Subject: ${notification.title}`);

    // TODO: Implementar Azure Communication Services
    return { sent: true };
  }
}