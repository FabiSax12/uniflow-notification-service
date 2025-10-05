import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = NotificationSchema & Document;

@Schema({
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  collection: 'notifications',
  _id: false,
})
export class NotificationSchema {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    required: true,
    enum: [
      'deadline_reminder',
      'exam_reminder',
      'task_created',
      'grade_posted',
    ],
  })
  type: string;

  @Prop({
    required: true,
    enum: ['high', 'medium', 'low'],
  })
  priority: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  readAt?: Date;

  @Prop({ type: String, default: null })
  taskId?: string;

  @Prop({ type: String, default: null })
  subjectId?: string;

  @Prop({ type: String, default: null })
  actionUrl?: string;

  @Prop({ type: Date, default: null, index: true })
  scheduledFor?: Date;
}

export const NotificationMongoSchema =
  SchemaFactory.createForClass(NotificationSchema);

// Indexes for better performance
NotificationMongoSchema.index({ userId: 1, createdAt: -1 });
NotificationMongoSchema.index({ userId: 1, isRead: 1 });
NotificationMongoSchema.index({ scheduledFor: 1, isRead: 1 });