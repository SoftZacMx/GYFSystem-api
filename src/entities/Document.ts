import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Student } from './Student';
import { DocumentCategory } from './DocumentCategory';
import { User } from './User';
import { Notification } from './Notification';

@Entity('document')
@Unique('UQ_document_student_category', ['studentId', 'categoryId'])
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'student_id', type: 'int' })
  studentId: number;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ name: 'uploaded_by', type: 'int' })
  uploadedBy: number;

  @Column({ name: 'file_url', type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ name: 'uploaded_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  @Column({ name: 'signature_hash', type: 'text', nullable: true })
  signatureHash: string | null;

  @Column({ name: 'verified_at', type: 'datetime', nullable: true })
  verifiedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @ManyToOne(() => Student, (student) => student.documents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => DocumentCategory, (category) => category.documents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: DocumentCategory;

  @ManyToOne(() => User, (user) => user.documents, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploaded_by' })
  uploadedByUser: User;

  @OneToMany(() => Notification, (notif) => notif.document)
  notifications: Notification[];
}
