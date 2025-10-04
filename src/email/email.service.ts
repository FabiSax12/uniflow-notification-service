import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailClient, EmailMessage } from '@azure/communication-email';
import { EmailTemplates } from './templates/email-templates';

export interface NotificationEmailData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  taskId?: string;
  subjectId?: string;
  actionUrl?: string;
  metadata?: {
    taskTitle?: string;
    subjectName?: string;
    dueDate?: string;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private emailClient: EmailClient;
  private readonly senderAddress: string;
  private readonly emailEnabled: boolean;
  private readonly frontendUrl: string;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'AZURE_COMMUNICATION_CONNECTION_STRING'
    );

    this.senderAddress = this.configService.get<string>(
      'AZURE_COMMUNICATION_SENDER_ADDRESS',
      'DoNotReply@059ab36d-eeed-40a9-a8ee-c5779bb03e64.azurecomm.net'
    );

    this.frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://uniflow.fabian-vargas.com'
    );

    this.emailEnabled = this.configService.get<string>(
      'EMAIL_ENABLED',
      'true'
    ) === 'true';

    if (!this.emailEnabled) {
      this.logger.warn('📧 Email service is DISABLED in configuration');
      return;
    }

    if (!connectionString) {
      this.logger.error('❌ Azure Communication connection string not configured');
      this.emailEnabled = false;
      return;
    }

    try {
      this.emailClient = new EmailClient(connectionString);
      this.logger.log('✅ Azure Communication Email Service initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize Email Client:', error);
      this.emailEnabled = false;
    }
  }

  /**
   * Enviar email de notificación basado en el tipo
   */
  async sendNotificationEmail(notification: NotificationEmailData): Promise<boolean> {
    if (!this.emailEnabled) {
      this.logger.warn('📧 [SKIPPED] Email disabled - would send:', notification.title);
      return false;
    }

    try {
      // Obtener email del usuario (esto deberías obtenerlo de tu UserService)
      const recipientEmail = notification.userEmail

      if (!recipientEmail) {
        this.logger.warn(`⚠️ No email found for user: ${notification.userId}`);
        return false;
      }

      // Obtener nombre del usuario
      const userName = notification.userName

      // Generar el template apropiado según el tipo
      const emailContent = this.getEmailTemplate(notification, userName);

      // Preparar el mensaje
      const message: EmailMessage = {
        senderAddress: this.senderAddress,
        content: {
          subject: emailContent.subject,
          plainText: emailContent.text,
          html: emailContent.html,
        },
        recipients: {
          to: [{ address: recipientEmail }],
        },
      };

      // Enviar email
      this.logger.log(`📤 Sending email to ${recipientEmail}: "${emailContent.subject}"`);

      const poller = await this.emailClient.beginSend(message);
      const result = await poller.pollUntilDone();

      if (result.status === 'Succeeded') {
        this.logger.log(`✅ Email sent successfully to ${recipientEmail} (ID: ${result.id})`);
        return true;
      } else {
        this.logger.error(`❌ Email failed with status: ${result.status}`);
        return false;
      }

    } catch (error) {
      this.logger.error(`❌ Error sending email for notification ${notification.id}:`, error);
      return false;
    }
  }

  /**
   * Seleccionar el template correcto según el tipo de notificación
   */
  private getEmailTemplate(notification: NotificationEmailData, userName: string) {
    const taskUrl = notification.actionUrl ||
      `${this.frontendUrl}/tasks/${notification.taskId}`;

    switch (notification.type) {
      case 'deadline_reminder':
        return EmailTemplates.deadlineReminder({
          userName,
          taskTitle: notification.metadata?.taskTitle || notification.title,
          dueDate: notification.metadata?.dueDate || 'Próximamente',
          taskUrl,
        });

      case 'task_created':
        return EmailTemplates.taskCreated({
          userName,
          taskTitle: notification.metadata?.taskTitle || notification.title,
          subjectName: notification.metadata?.subjectName || 'Tu materia',
          dueDate: notification.metadata?.dueDate || 'Por definir',
          taskUrl,
        });

      case 'exam_reminder':
      case 'grade_posted':
      default:
        return EmailTemplates.generic({
          userName,
          title: notification.title,
          message: notification.message,
          actionUrl: taskUrl,
          actionText: 'Ver Detalles',
        });
    }
  }
}