import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Document } from './Document';
import { Event } from './Event';

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'document_id', type: 'int', nullable: true })
  documentId: number | null;

  @Column({ name: 'event_id', type: 'int', nullable: true })
  eventId: number | null;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Document, (doc) => doc.notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'document_id' })
  document: Document | null;

  @ManyToOne(() => Event, (event) => event.notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'event_id' })
  event: Event | null;
}
