import { NotificationResponseDto } from './notification-response.dto';

export class WebSocketEventDto {
  event: string;
  data: NotificationResponseDto;

  constructor(event: string, data: NotificationResponseDto) {
    this.event = event;
    this.data = data;
  }
}
