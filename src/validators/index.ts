export {
  PAGINATION_DEFAULTS,
  orderSchema,
  createPaginationQuerySchema,
  type PaginationQueryInput,
} from './pagination';

export { loginBodySchema, verifyAccountQuerySchema, type LoginBody, type VerifyAccountQuery } from './auth';

export {
  createUserBodySchema,
  updateUserBodySchema,
  type CreateUserBody,
  type UpdateUserBody,
} from './user';

export {
  createStudentBodySchema,
  updateStudentBodySchema,
  studentQuerySchema,
  type CreateStudentBody,
  type UpdateStudentBody,
  type StudentQuery,
} from './student';

export {
  parentStudentBodySchema,
  type ParentStudentBody,
} from './parent-student';

export {
  createDocumentCategoryBodySchema,
  updateDocumentCategoryBodySchema,
  type CreateDocumentCategoryBody,
  type UpdateDocumentCategoryBody,
} from './document-category';

export {
  createDocumentBodySchema,
  documentQuerySchema,
  type CreateDocumentBody,
  type DocumentQuery,
} from './document';

export {
  uploadDocumentFieldsSchema,
  type UploadDocumentFields,
} from './upload';

export {
  createEventBodySchema,
  updateEventBodySchema,
  eventQuerySchema,
  type CreateEventBody,
  type UpdateEventBody,
  type EventQuery,
} from './event';

export {
  createNotificationBodySchema,
  notificationQuerySchema,
  type CreateNotificationBody,
  type NotificationQuery,
} from './notification';

export {
  companyIdQuerySchema,
  createCompanyBodySchema,
  updateCompanyBodySchema,
  type CompanyIdQuery,
  type CreateCompanyBody,
  type UpdateCompanyBody,
} from './company';
