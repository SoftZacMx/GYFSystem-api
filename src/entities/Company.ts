import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('company')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  timezone: string | null;

  @Column({ name: 'theme_config', type: 'json', nullable: true })
  themeConfig: { primaryColor?: string; accentColor?: string } | null;

  @Column({ name: 'smtp_host', type: 'varchar', length: 255, nullable: true })
  smtpHost: string | null;

  @Column({ name: 'smtp_port', type: 'int', nullable: true })
  smtpPort: number | null;

  @Column({ name: 'smtp_user', type: 'varchar', length: 255, nullable: true })
  smtpUser: string | null;

  @Column({ name: 'smtp_pass', type: 'text', nullable: true })
  smtpPass: string | null;

  @Column({ name: 'smtp_from', type: 'varchar', length: 255, nullable: true })
  smtpFrom: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
