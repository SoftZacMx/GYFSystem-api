import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserType } from './UserType';
import { Role } from './Role';
import { ParentStudent } from './ParentStudent';
import { Document } from './Document';
import { Event } from './Event';
import { Notification } from './Notification';
import { AuditLog } from './AuditLog';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'user_type_id', type: 'int' })
  userTypeId: number;

  @Column({ name: 'role_id', type: 'int' })
  roleId: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => UserType, (userType) => userType.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_type_id' })
  userType: UserType;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => ParentStudent, (ps) => ps.user)
  parentStudents: ParentStudent[];

  @OneToMany(() => Document, (doc) => doc.uploadedByUser)
  documents: Document[];

  @OneToMany(() => Event, (event) => event.createdByUser)
  events: Event[];

  @OneToMany(() => Notification, (notif) => notif.user)
  notifications: Notification[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];
}
