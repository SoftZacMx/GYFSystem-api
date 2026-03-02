import { DataSource } from 'typeorm';
import { UserRepository } from './UserRepository';
import { RoleRepository } from './RoleRepository';
import { UserTypeRepository } from './UserTypeRepository';
import { StudentRepository } from './StudentRepository';
import { ParentStudentRepository } from './ParentStudentRepository';
import { DocumentCategoryRepository } from './DocumentCategoryRepository';
import { DocumentRepository } from './DocumentRepository';
import { EventRepository } from './EventRepository';
import { NotificationRepository } from './NotificationRepository';
import { AuditLogRepository } from './AuditLogRepository';
import { CompanyRepository } from './CompanyRepository';
import type { IUserRepository } from './interfaces/IUserRepository';
import type { IRoleRepository } from './interfaces/IRoleRepository';
import type { IUserTypeRepository } from './interfaces/IUserTypeRepository';
import type { IStudentRepository } from './interfaces/IStudentRepository';
import type { IParentStudentRepository } from './interfaces/IParentStudentRepository';
import type { IDocumentCategoryRepository } from './interfaces/IDocumentCategoryRepository';
import type { IDocumentRepository } from './interfaces/IDocumentRepository';
import type { IEventRepository } from './interfaces/IEventRepository';
import type { INotificationRepository } from './interfaces/INotificationRepository';
import type { IAuditLogRepository } from './interfaces/IAuditLogRepository';
import type { ICompanyRepository } from './interfaces/ICompanyRepository';

export interface RepositoryFactoryResult {
  userRepository: IUserRepository;
  roleRepository: IRoleRepository;
  userTypeRepository: IUserTypeRepository;
  studentRepository: IStudentRepository;
  parentStudentRepository: IParentStudentRepository;
  documentCategoryRepository: IDocumentCategoryRepository;
  documentRepository: IDocumentRepository;
  eventRepository: IEventRepository;
  notificationRepository: INotificationRepository;
  auditLogRepository: IAuditLogRepository;
  companyRepository: ICompanyRepository;
}

export function createRepositoryFactory(dataSource: DataSource): RepositoryFactoryResult {
  return {
    userRepository: new UserRepository(dataSource),
    roleRepository: new RoleRepository(dataSource),
    userTypeRepository: new UserTypeRepository(dataSource),
    studentRepository: new StudentRepository(dataSource),
    parentStudentRepository: new ParentStudentRepository(dataSource),
    documentCategoryRepository: new DocumentCategoryRepository(dataSource),
    documentRepository: new DocumentRepository(dataSource),
    eventRepository: new EventRepository(dataSource),
    notificationRepository: new NotificationRepository(dataSource),
    auditLogRepository: new AuditLogRepository(dataSource),
    companyRepository: new CompanyRepository(dataSource),
  };
}
