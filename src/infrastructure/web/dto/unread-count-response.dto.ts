import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({
    description: 'The ID of the user',
    example: 'user-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Number of unread notifications',
    example: 5,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Timestamp when the count was checked',
    example: '2025-10-06T10:30:00Z',
  })
  lastChecked: Date;
}
