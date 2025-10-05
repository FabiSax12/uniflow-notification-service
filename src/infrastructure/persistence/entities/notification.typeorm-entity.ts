import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column()
  type: string;

  @Column()
  priority: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  taskId?: string;

  @Column({ nullable: true })
  subjectId?: string;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({ nullable: true, type: 'timestamp' })
  scheduledFor?: Date;
}
