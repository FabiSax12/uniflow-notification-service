import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString, IsEmail } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

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