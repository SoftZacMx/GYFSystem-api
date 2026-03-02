import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Student } from './Student';

@Entity('parent_student')
export class ParentStudent {
  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId: number;

  @PrimaryColumn({ name: 'student_id', type: 'int' })
  studentId: number;

  @ManyToOne(() => User, (user) => user.parentStudents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Student, (student) => student.parentStudents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
