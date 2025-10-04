import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
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
  @IsDateString()
  scheduledFor?: string;
}