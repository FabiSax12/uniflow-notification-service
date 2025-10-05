import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NotificationHubsClient,
  createFcmV1RegistrationDescription,
} from '@azure/notification-hubs';

@Injectable()
export class DeviceRegistrationService {
  private readonly logger = new Logger(DeviceRegistrationService.name);
  private hubClient: NotificationHubsClient;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'AZURE_NOTIFICATION_HUB_CONNECTION_STRING'
    );
    const hubName = this.configService.get<string>(
      'AZURE_NOTIFICATION_HUB_NAME'
    );

    if (!connectionString || !hubName) {
      throw new Error(
        'Azure Notification Hub configuration is missing in environment variables.'
      );
    }

    this.hubClient = new NotificationHubsClient(connectionString, hubName);
  }

  /**
   * Registra un dispositivo Android con FCM v1
   */
  async registerDevice(userId: string, fcmToken: string): Promise<void> {
    try {
      // Crear descripción de registro para FCM v1
      const registration = createFcmV1RegistrationDescription({
        fcmV1RegistrationId: fcmToken,
        tags: [`userId:${userId}`], // Tag para identificar al usuario
      });

      const result = await this.hubClient.createOrUpdateRegistration(
        registration
      );

      this.logger.log(
        `Device registered for user ${userId}. RegistrationId: ${result.registrationId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to register device for user ${userId}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Elimina el registro de un dispositivo
   */
  async unregisterDevice(registrationId: string): Promise<void> {
    try {
      await this.hubClient.deleteRegistration(registrationId);
      this.logger.log(`Device unregistered: ${registrationId}`);
    } catch (error) {
      this.logger.error(
        `Failed to unregister device ${registrationId}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Obtiene todos los registros de un usuario
   */
  async getUserRegistrations(userId: string) {
    try {
      const registrations = await this.hubClient.listRegistrationsByTag(
        `userId:${userId}`
      );
      // Convert registrations to array if it's an async iterable
      const result: any[] = [];
      for await (const reg of registrations) {
        result.push(reg);
      }
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to get registrations for user ${userId}`,
        error.stack
      );
      return [];
    }
  }
}