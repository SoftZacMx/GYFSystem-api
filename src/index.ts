import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env, logger, appDataSource, s3Client, s3Bucket } from './config';
import { openApiDocument } from './config/openapi';
import { requestLogger } from './middlewares/request-logger';
import { createRepositoryFactory } from './repositories/repository-factory';
import { registerAuthRoutes } from './routes/auth.routes';
import { registerUserTypeRoutes } from './routes/user-types.routes';
import { registerRoleRoutes } from './routes/roles.routes';
import { registerUserRoutes } from './routes/users.routes';
import { registerStudentRoutes } from './routes/students.routes';
import { registerParentStudentRoutes } from './routes/parent-students.routes';
import { registerDocumentCategoryRoutes } from './routes/document-categories.routes';
import { registerDocumentRoutes } from './routes/documents.routes';
import { registerEventRoutes } from './routes/events.routes';
import { registerNotificationRoutes } from './routes/notifications.routes';
import { registerCompanyRoutes } from './routes/company.routes';
import { registerDashboardRoutes } from './routes/dashboard.routes';
import { AuthService } from './services/AuthService';
import { UserTypeService } from './services/UserTypeService';
import { RoleService } from './services/RoleService';
import { UserService } from './services/UserService';
import { StudentService } from './services/StudentService';
import { ParentStudentService } from './services/ParentStudentService';
import { DocumentCategoryService } from './services/DocumentCategoryService';
import { DocumentService } from './services/DocumentService';
import { StorageService } from './services/StorageService';
import { AuthController } from './controllers/AuthController';
import { UserTypeController } from './controllers/UserTypeController';
import { RoleController } from './controllers/RoleController';
import { UserController } from './controllers/UserController';
import { StudentController } from './controllers/StudentController';
import { ParentStudentController } from './controllers/ParentStudentController';
import { DocumentCategoryController } from './controllers/DocumentCategoryController';
import { DocumentController } from './controllers/DocumentController';
import { EventService } from './services/EventService';
import { EventController } from './controllers/EventController';
import { NotificationService } from './services/NotificationService';
import { NotificationController } from './controllers/NotificationController';
import { MailService } from './mail';
import { AuditService } from './services/AuditService';
import { SignatureService } from './services/SignatureService';
import { CompanyService } from './services/CompanyService';
import { CompanyController } from './controllers/CompanyController';
import { DashboardService } from './services/DashboardService';
import { DashboardController } from './controllers/DashboardController';
import { globalErrorHandler, createAppError } from './middlewares/global-error-handler';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(requestLogger);
const isDev = env.NODE_ENV !== 'production';
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 500 : 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Files Manager API', status: 'ok' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/readiness', async (_req: Request, res: Response) => {
  try {
    await appDataSource.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected', timestamp: new Date().toISOString() });
  }
});

const mailService = new MailService({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER,
  pass: env.SMTP_PASS,
  from: env.SMTP_FROM,
  resendApiKey: env.RESEND_API_KEY,
});

const { userRepository, userTypeRepository, roleRepository, studentRepository, parentStudentRepository, documentCategoryRepository, documentRepository, eventRepository, notificationRepository, auditLogRepository, companyRepository } = createRepositoryFactory(appDataSource);

const auditService = new AuditService(auditLogRepository);
const companyService = new CompanyService(companyRepository);

const authService = new AuthService(userRepository, auditService, mailService, companyService);
const authController = new AuthController(authService);
registerAuthRoutes(app, authController);

const userTypeService = new UserTypeService(userTypeRepository);
const userTypeController = new UserTypeController(userTypeService);
registerUserTypeRoutes(app, userTypeController);

const roleService = new RoleService(roleRepository);
const roleController = new RoleController(roleService);
registerRoleRoutes(app, roleController);

const userService = new UserService(userRepository, auditService);
const userController = new UserController(userService, authService);
registerUserRoutes(app, userController);

const parentStudentService = new ParentStudentService(parentStudentRepository, userRepository, studentRepository);
const parentStudentController = new ParentStudentController(parentStudentService);
registerParentStudentRoutes(app, parentStudentController);

const studentService = new StudentService(
  studentRepository,
  documentCategoryRepository,
  documentRepository,
  auditService
);
const studentController = new StudentController(studentService, parentStudentService);
registerStudentRoutes(app, studentController);

const documentCategoryService = new DocumentCategoryService(documentCategoryRepository);
const documentCategoryController = new DocumentCategoryController(documentCategoryService);
registerDocumentCategoryRoutes(app, documentCategoryController);

const storageService = new StorageService(s3Client, s3Bucket, env.S3_REGION, env.S3_ENDPOINT);
const signatureService = new SignatureService(env.SIGNATURE_PRIVATE_KEY_PATH, env.SIGNATURE_PUBLIC_KEY_PATH);
const documentService = new DocumentService(documentRepository, studentRepository, documentCategoryRepository, storageService, auditService, signatureService, env.APP_URL);
const documentController = new DocumentController(documentService, env.APP_URL, parentStudentService);
registerDocumentRoutes(app, documentController);

const eventService = new EventService(eventRepository, notificationRepository, userRepository, mailService, auditService, companyService);
const eventController = new EventController(eventService);
registerEventRoutes(app, eventController);

const notificationService = new NotificationService(notificationRepository, userRepository, mailService, companyService);
const notificationController = new NotificationController(notificationService);
registerNotificationRoutes(app, notificationController);

const companyController = new CompanyController(companyService);
registerCompanyRoutes(app, companyController);

const dashboardService = new DashboardService(
  studentRepository,
  userRepository,
  eventRepository,
  documentRepository,
  documentCategoryRepository
);
const dashboardController = new DashboardController(dashboardService);
registerDashboardRoutes(app, dashboardController);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createAppError('Resource or route not found', 'NOT_FOUND'));
});

app.use(globalErrorHandler);

async function start(): Promise<void> {
  await appDataSource.initialize();
  logger.info('Database connected');

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, `Server running at http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
