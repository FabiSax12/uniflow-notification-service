// src/queue/queue-processor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AzureQueueService } from './azure-queue.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../email/email.service';

interface QueueMessage {
  type: string;
  userId: string;
  title: string;
  message: string;
  priority?: 'high' | 'medium' | 'low';
  taskId?: string;
  subjectId?: string;
  scheduledFor?: string;
  metadata?: any;
}

@Injectable()
export class QueueProcessorService {
  private readonly logger = new Logger(QueueProcessorService.name);

  constructor(
    private azureQueueService: AzureQueueService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) { }

  /**
   * Polling de la cola cada 5 segundos
   * Puedes ajustar la frecuencia según tus necesidades
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processQueueMessages() {
    try {
      const messages = await this.azureQueueService.receiveMessages(10);

      if (messages.length === 0) {
        return; // No hay mensajes, salir silenciosamente
      }

      this.logger.log(`📨 Processing ${messages.length} messages from queue`);

      for (const message of messages) {
        try {
          // Decodificar el mensaje (viene en base64)
          const decodedText = Buffer.from(
            message.messageText,
            'base64'
          ).toString('utf-8');

          const queueMessage: QueueMessage = JSON.parse(decodedText);

          // Procesar el mensaje
          await this.processMessage(queueMessage);

          // Eliminar el mensaje de la cola después de procesarlo exitosamente
          await this.azureQueueService.deleteMessage(
            message.messageId,
            message.popReceipt
          );

          this.logger.debug(`✅ Message processed successfully: ${message.messageId}`);
        } catch (error) {
          this.logger.error(
            `❌ Error processing message ${message.messageId}:`,
            error
          );
          // El mensaje volverá a la cola después del visibilityTimeout
        }
      }
    } catch (error) {
      this.logger.error('❌ Error in queue processing:', error);
    }
  }

  /**
   * Procesar un mensaje específico según su tipo
   */
  private async processMessage(queueMessage: QueueMessage) {
    this.logger.log(`🔄 Processing message type: ${queueMessage.type}`);

    // 1. Crear la notificación en la base de datos
    const notification = await this.notificationsService.create({
      userId: queueMessage.userId,
      title: queueMessage.title,
      message: queueMessage.message,
      type: queueMessage.type,
      priority: queueMessage.priority || 'medium',
      taskId: queueMessage.taskId,
      subjectId: queueMessage.subjectId,
      scheduledFor: queueMessage.scheduledFor,
    });

    this.logger.log(`📝 Notification created in DB: ${notification.id}`);

    // 2. Enviar email si la prioridad es alta
    if (queueMessage.priority === 'high') {
      try {
        await this.emailService.sendNotificationEmail(notification);
        this.logger.log(`📧 Email sent for notification: ${notification.id}`);
      } catch (error) {
        this.logger.error('❌ Failed to send email:', error);
        // No fallar el proceso completo si el email falla
      }
    }

    // 3. Acciones específicas según el tipo de notificación
    await this.handleNotificationType(queueMessage.type, notification);
  }

  /**
   * Manejar lógica específica según el tipo de notificación
   */
  private async handleNotificationType(type: string, notification: any) {
    switch (type) {
      case 'deadline_reminder':
        this.logger.log('⏰ Deadline reminder processed');
        // Aquí podrías agregar lógica adicional
        break;

      case 'task_created':
        this.logger.log('📋 Task created notification processed');
        break;

      case 'exam_reminder':
        this.logger.log('📚 Exam reminder processed');
        break;

      default:
        this.logger.log(`ℹ️ Generic notification processed: ${type}`);
    }
  }
}