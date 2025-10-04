// src/queue/azure-queue.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { QueueServiceClient, QueueClient } from '@azure/storage-queue';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AzureQueueService {
  private readonly logger = new Logger(AzureQueueService.name);
  private queueClient: QueueClient;
  private readonly queueName = 'notifications-queue';

  constructor(private configService: ConfigService) {
    this.initializeQueue();
  }

  private async initializeQueue() {
    try {
      const connectionString = this.configService.get<string>(
        'AZURE_STORAGE_CONNECTION_STRING'
      );

      if (!connectionString) {
        throw new Error('Azure Storage connection string not configured');
      }

      const queueServiceClient = QueueServiceClient.fromConnectionString(
        connectionString
      );

      this.queueClient = queueServiceClient.getQueueClient(this.queueName);

      // Crear la cola si no existe
      await this.queueClient.createIfNotExists();

      this.logger.log(`✅ Connected to Azure Queue: ${this.queueName}`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize Azure Queue', error);
      throw error;
    }
  }

  /**
   * Recibir mensajes de la cola
   */
  async receiveMessages(maxMessages: number = 10) {
    try {
      const response = await this.queueClient.receiveMessages({
        numberOfMessages: maxMessages,
        visibilityTimeout: 60, // Ocultar mensaje por 60 segundos mientras se procesa
      });

      return response.receivedMessageItems || [];
    } catch (error) {
      this.logger.error('Error receiving messages from queue', error);
      return [];
    }
  }

  /**
   * Eliminar mensaje después de procesarlo
   */
  async deleteMessage(messageId: string, popReceipt: string) {
    try {
      await this.queueClient.deleteMessage(messageId, popReceipt);
      this.logger.debug(`✅ Message deleted: ${messageId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to delete message: ${messageId}`, error);
    }
  }

  /**
   * Enviar mensaje a la cola (para testing o uso interno)
   */
  async sendMessage(message: any) {
    try {
      const messageText = JSON.stringify(message);
      await this.queueClient.sendMessage(Buffer.from(messageText).toString('base64'));
      this.logger.log('📤 Message sent to queue');
    } catch (error) {
      this.logger.error('❌ Failed to send message', error);
      throw error;
    }
  }
}