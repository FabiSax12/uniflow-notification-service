import { Injectable, Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationBroadcasterPort } from '../../application/ports/notification-broadcaster.port';
import { Notification } from '../../domain/entities/notification';
import { NotificationResponseDto } from './dto/notification-response.dto';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, NotificationBroadcasterPort {

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);

    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client.id);
      void client.join(`user:${userId}`);
      this.logger.log(`User ${userId} joined with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  broadcastToUser(userId: string, notification: Notification): Promise<void> {
    const notificationDto = NotificationResponseDto.fromDomain(notification);
    this.server.to(`user:${userId}`).emit('new_notification', notificationDto);
    this.logger.log(`Broadcasted notification to user ${userId}`);
    return Promise.resolve();
  }

  broadcastToAll(notification: Notification): Promise<void> {
    const notificationDto = NotificationResponseDto.fromDomain(notification);
    this.server.emit('new_notification', notificationDto);
    this.logger.log(`Broadcasted notification to all users`);
    return Promise.resolve();
  }
}
