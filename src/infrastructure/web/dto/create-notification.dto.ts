import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'The ID of the user to receive the notification',
    example: 'user-123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'The name of the user to receive the notification',
    example: 'Fabian Vargas',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The email of the user to receive the notification',
    example: 'fabian.vargas@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'The title of the notification',
    example: 'Assignment Due Tomorrow',
    maxLength: 200,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The message content of the notification',
    example: 'Your mathematics assignment is due tomorrow at 11:59 PM',
    maxLength: 1000,
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'The type of notification',
    enum: [
      'deadline_reminder',
      'exam_reminder',
      'task_created',
      'grade_posted',
    ],
    example: 'deadline_reminder',
  })
  @IsString()
  @IsIn(['deadline_reminder', 'exam_reminder', 'task_created', 'grade_posted'])
  type: string;

  @ApiProperty({
    description: 'The priority level of the notification',
    enum: ['high', 'medium', 'low'],
    example: 'high',
  })
  @IsString()
  @IsIn(['high', 'medium', 'low'])
  priority: string;

  @ApiPropertyOptional({
    description: 'Optional task ID associated with the notification',
    example: 'task-456',
  })
  @IsOptional()
  @IsString()
  taskId?: string;

  @ApiPropertyOptional({
    description: 'Optional subject/course ID associated with the notification',
    example: 'course-789',
  })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Optional URL for the user to take action',
    example: 'https://app.example.com/assignments/123',
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional scheduled date/time for the notification to be sent',
    example: '2025-10-07T10:00:00Z',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
