import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationListResponseDto {
  @ApiProperty({
    description: 'Array of notifications',
    type: [NotificationResponseDto],
  })
  notifications: NotificationResponseDto[];

  @ApiProperty({
    description: 'Total count of notifications for the user',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Whether there are more notifications available',
    example: true,
  })
  hasMore: boolean;
}
