import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { ParentStudent } from './ParentStudent';
import { Document } from './Document';

@Entity('student')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 18, unique: true })
  curp: string;

  @Column({ type: 'varchar', length: 50 })
  grade: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ParentStudent, (ps) => ps.student)
  parentStudents: ParentStudent[];

  @OneToMany(() => Document, (doc) => doc.student)
  documents: Document[];
}
