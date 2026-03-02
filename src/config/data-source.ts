import { DataSource } from 'typeorm';
import path from 'path';
import { env } from './env';
import {
  UserType,
  Role,
  User,
  Student,
  ParentStudent,
  DocumentCategory,
  Document,
  Event,
  Notification,
  AuditLog,
  Company,
} from '../entities';

export const appDataSource = new DataSource({
  type: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [
    UserType,
    Role,
    User,
    Student,
    ParentStudent,
    DocumentCategory,
    Document,
    Event,
    Notification,
    AuditLog,
    Company,
  ],
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
});
