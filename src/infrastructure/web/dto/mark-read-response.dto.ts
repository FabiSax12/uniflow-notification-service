import { ApiProperty } from '@nestjs/swagger';

export class MarkReadResponseDto {
  @ApiProperty({
    description: 'The ID of the notification',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Whether the notification is now marked as read',
    example: true,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Timestamp when the notification was marked as read',
    example: '2025-10-06T10:30:00Z',
  })
  markedAt: Date;

  @ApiProperty({
    description: 'Whether the operation was successful',
    example: true,
  })
  success: boolean;
}
