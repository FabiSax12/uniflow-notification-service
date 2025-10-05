import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsIn(['deadline_reminder', 'exam_reminder', 'task_created', 'grade_posted'])
  type: string;

  @IsString()
  @IsIn(['high', 'medium', 'low'])
  priority: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsOptional()
  @IsString()
  subjectId?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
