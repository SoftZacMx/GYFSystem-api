import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Notification } from './Notification';

@Entity('event')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_by', type: 'int' })
  createdBy: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'event_date', type: 'datetime' })
  eventDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => Notification, (notif) => notif.event)
  notifications: Notification[];
}
