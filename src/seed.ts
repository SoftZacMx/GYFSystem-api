import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { appDataSource } from './config/data-source';
import { logger } from './config/logger';
import { UserType } from './entities/UserType';
import { Role } from './entities/Role';
import { User } from './entities/User';
import { Student } from './entities/Student';
import { ParentStudent } from './entities/ParentStudent';
import { DocumentCategory } from './entities/DocumentCategory';

const BCRYPT_ROUNDS = 10;

async function seed(): Promise<void> {
  await appDataSource.initialize();
  logger.info('Database connected — starting seed');

  // ── User Types ──
  const userTypeRepo = appDataSource.getRepository(UserType);
  const userTypes = await userTypeRepo.save([
    { name: 'Administrador' },
    { name: 'Docente' },
    { name: 'Padre de familia' },
  ]);
  logger.info(`Seeded ${userTypes.length} user types`);

  // ── Roles ──
  const roleRepo = appDataSource.getRepository(Role);
  const roles = await roleRepo.save([
    { name: 'admin' },
    { name: 'editor' },
    { name: 'viewer' },
  ]);
  logger.info(`Seeded ${roles.length} roles`);

  // ── Users ──
  const userRepo = appDataSource.getRepository(User);
  const password = await bcrypt.hash('password123', BCRYPT_ROUNDS);
  const verifiedAt = new Date();

  const users = await userRepo.save([
    {
      name: 'Admin Principal',
      email: 'admin@filesmanager.com',
      password,
      userTypeId: userTypes[0].id, // Administrador
      roleId: roles[0].id,         // admin
      status: 'active',
      isAccountActivated: true,
      emailVerifiedAt: verifiedAt,
    },
    {
      name: 'María García',
      email: 'maria@filesmanager.com',
      password,
      userTypeId: userTypes[1].id, // Docente
      roleId: roles[1].id,         // editor
      status: 'active',
      isAccountActivated: true,
      emailVerifiedAt: verifiedAt,
    },
    {
      name: 'Carlos López',
      email: 'carlos@filesmanager.com',
      password,
      userTypeId: userTypes[2].id, // Padre de familia
      roleId: roles[2].id,         // viewer
      status: 'active',
      isAccountActivated: true,
      emailVerifiedAt: verifiedAt,
    },
    {
      name: 'Ana Martínez',
      email: 'ana@filesmanager.com',
      password,
      userTypeId: userTypes[2].id, // Padre de familia
      roleId: roles[2].id,         // viewer
      status: 'active',
      isAccountActivated: true,
      emailVerifiedAt: verifiedAt,
    },
  ]);
  logger.info(`Seeded ${users.length} users`);

  // ── Students ──
  const studentRepo = appDataSource.getRepository(Student);
  const students = await studentRepo.save([
    { fullName: 'Pedro López García', curp: 'LOGP100515HDFRRD01', grade: '3A', status: 'active' },
    { fullName: 'Sofía López García', curp: 'LOGS120320MDFRRF02', grade: '1B', status: 'active' },
    { fullName: 'Diego Martínez Ruiz', curp: 'MARD110810HDFRGG03', grade: '2A', status: 'active' },
    { fullName: 'Valentina Martínez Ruiz', curp: 'MARV090225MDFRRL04', grade: '4B', status: 'active' },
    { fullName: 'Emiliano Ramírez Soto', curp: 'RASE130705HDFRMT05', grade: '1A', status: 'inactive' },
  ]);
  logger.info(`Seeded ${students.length} students`);

  // ── Parent-Student links ──
  const psRepo = appDataSource.getRepository(ParentStudent);
  const links = await psRepo.save([
    { userId: users[2].id, studentId: students[0].id }, // Carlos → Pedro
    { userId: users[2].id, studentId: students[1].id }, // Carlos → Sofía
    { userId: users[3].id, studentId: students[2].id }, // Ana → Diego
    { userId: users[3].id, studentId: students[3].id }, // Ana → Valentina
  ]);
  logger.info(`Seeded ${links.length} parent-student links`);

  // ── Document Categories ──
  const categoryRepo = appDataSource.getRepository(DocumentCategory);
  const categories = await categoryRepo.save([
    { name: 'Acta de nacimiento', description: 'Acta de nacimiento del estudiante' },
    { name: 'CURP', description: 'Constancia de CURP' },
    { name: 'Boleta de calificaciones', description: 'Boleta del ciclo escolar' },
    { name: 'Constancia médica', description: 'Certificado médico o cartilla de vacunación' },
    { name: 'Comprobante de domicilio', description: 'Recibo de luz, agua o teléfono reciente' },
    { name: 'Identificación del tutor', description: 'INE o pasaporte del padre/tutor' },
  ]);
  logger.info(`Seeded ${categories.length} document categories`);

  logger.info('Seed completed successfully');
  await appDataSource.destroy();
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
