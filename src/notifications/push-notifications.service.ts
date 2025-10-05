import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Notification,
  NotificationHubsClient
} from '@azure/notification-hubs';

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private hubClient: NotificationHubsClient;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'AZURE_NOTIFICATION_HUB_CONNECTION_STRING'
    );
    const hubName = this.configService.get<string>(
      'AZURE_NOTIFICATION_HUB_NAME'
    );

    if (!connectionString || !hubName) {
      this.logger.error('Azure Notification Hub configuration is missing');
      return;
    }

    // Validar formato del connection string
    if (!connectionString.startsWith('Endpoint=')) {
      this.logger.error('❌ Connection String mal formado. Debe empezar con "Endpoint="');
      this.logger.error(`Valor actual: ${connectionString.substring(0, 20)}...`);
      return;
    }

    if (!connectionString.includes('SharedAccessKeyName=')) {
      this.logger.error('❌ Connection String incompleto. Falta "SharedAccessKeyName="');
      return;
    }

    if (!connectionString.includes('SharedAccessKey=')) {
      this.logger.error('❌ Connection String incompleto. Falta "SharedAccessKey="');
      return;
    }

    this.hubClient = new NotificationHubsClient(connectionString, hubName);
    this.logger.log('Azure Notification Hub client initialized');
  }

  /**
   * Envía una push notification a un usuario específico usando FCM v1
   */
  async sendToUser(userId: string, notification: any): Promise<void> {
    try {
      // Formato FCM v1 API
      const fcmV1Payload = {
        message: {
          notification: {
            title: notification.title,
            body: notification.message,
          },
          data: {
            notificationId: notification.id.toString(),
            type: notification.type || 'general',
            ...notification.data,
          },
          // Opcional: configuración de Android
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              channelId: 'default',
            },
          },
        },
      };

      const message: Notification = {
        body: JSON.stringify(fcmV1Payload),
        contentType: 'application/json;charset=utf-8',
        platform: 'fcmv1',
      };

      const tagExpression = `userId:${userId}`;

      const result = await this.hubClient.sendNotification(message, {
        tagExpression,
      });

      this.logger.log(
        `Push notification sent to user ${userId}. TrackingId: ${result.trackingId}, State: ${result.state}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to user ${userId}`,
        error.stack
      );
    }
  }
}