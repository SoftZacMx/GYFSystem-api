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

async function upsertUserType(repo: ReturnType<typeof appDataSource.getRepository<UserType>>, name: string): Promise<UserType> {
  const existing = await repo.findOne({ where: { name } });
  if (existing) {
    return existing;
  }
  return repo.save(repo.create({ name }));
}

async function upsertRole(repo: ReturnType<typeof appDataSource.getRepository<Role>>, name: string): Promise<Role> {
  const existing = await repo.findOne({ where: { name } });
  if (existing) {
    return existing;
  }
  return repo.save(repo.create({ name }));
}

async function upsertUser(
  repo: ReturnType<typeof appDataSource.getRepository<User>>,
  data: { name: string; email: string; password: string; userTypeId: number; roleId: number; status: string; isAccountActivated: boolean; emailVerifiedAt: Date },
): Promise<User> {
  const existing = await repo.findOne({ where: { email: data.email } });
  if (existing) {
    existing.name = data.name;
    existing.password = data.password;
    existing.userTypeId = data.userTypeId;
    existing.roleId = data.roleId;
    existing.status = data.status;
    existing.isAccountActivated = data.isAccountActivated;
    existing.emailVerifiedAt = data.emailVerifiedAt;
    return repo.save(existing);
  }
  return repo.save(repo.create(data));
}

async function upsertStudent(
  repo: ReturnType<typeof appDataSource.getRepository<Student>>,
  data: { fullName: string; curp: string; grade: string; status: string },
): Promise<Student> {
  const existing = await repo.findOne({ where: { curp: data.curp } });
  if (existing) {
    existing.fullName = data.fullName;
    existing.grade = data.grade;
    existing.status = data.status;
    return repo.save(existing);
  }
  return repo.save(repo.create(data));
}

async function upsertParentStudent(
  repo: ReturnType<typeof appDataSource.getRepository<ParentStudent>>,
  userId: number,
  studentId: number,
): Promise<ParentStudent> {
  const existing = await repo.findOne({ where: { userId, studentId } });
  if (existing) {
    return existing;
  }
  return repo.save(repo.create({ userId, studentId }));
}

async function upsertDocumentCategory(
  repo: ReturnType<typeof appDataSource.getRepository<DocumentCategory>>,
  name: string,
  description: string,
): Promise<DocumentCategory> {
  const existing = await repo.findOne({ where: { name } });
  if (existing) {
    existing.description = description;
    return repo.save(existing);
  }
  return repo.save(repo.create({ name, description }));
}

async function seed(): Promise<void> {
  await appDataSource.initialize();
  logger.info('Database connected — starting seed');

  // ── User Types ──
  const userTypeRepo = appDataSource.getRepository(UserType);
  const userTypes = [
    await upsertUserType(userTypeRepo, 'Administrador'),
    await upsertUserType(userTypeRepo, 'Docente'),
    await upsertUserType(userTypeRepo, 'Padre de familia'),
  ];
  logger.info(`Seeded ${userTypes.length} user types`);

  // ── Roles ──
  const roleRepo = appDataSource.getRepository(Role);
  const roles = [
    await upsertRole(roleRepo, 'admin'),
    await upsertRole(roleRepo, 'editor'),
    await upsertRole(roleRepo, 'viewer'),
  ];
  logger.info(`Seeded ${roles.length} roles`);

  // ── Users ──
  const userRepo = appDataSource.getRepository(User);
  const password = await bcrypt.hash('password123', BCRYPT_ROUNDS);
  const verifiedAt = new Date();

  const userPayloads = [
    { name: 'Admin Principal', email: 'admin@filesmanager.com', userTypeId: userTypes[0].id, roleId: roles[0].id },
    { name: 'María García', email: 'maria@filesmanager.com', userTypeId: userTypes[1].id, roleId: roles[1].id },
    { name: 'Carlos López', email: 'carlos@filesmanager.com', userTypeId: userTypes[2].id, roleId: roles[2].id },
    { name: 'Ana Martínez', email: 'ana@filesmanager.com', userTypeId: userTypes[2].id, roleId: roles[2].id },
  ];

  const users = await Promise.all(
    userPayloads.map((p) =>
      upsertUser(userRepo, {
        ...p,
        password,
        status: 'active',
        isAccountActivated: true,
        emailVerifiedAt: verifiedAt,
      }),
    ),
  );
  logger.info(`Seeded ${users.length} users`);

  // ── Students ──
  const studentRepo = appDataSource.getRepository(Student);
  const studentPayloads = [
    { fullName: 'Pedro López García', curp: 'LOGP100515HDFRRD01', grade: '3A', status: 'active' },
    { fullName: 'Sofía López García', curp: 'LOGS120320MDFRRF02', grade: '1B', status: 'active' },
    { fullName: 'Diego Martínez Ruiz', curp: 'MARD110810HDFRGG03', grade: '2A', status: 'active' },
    { fullName: 'Valentina Martínez Ruiz', curp: 'MARV090225MDFRRL04', grade: '4B', status: 'active' },
    { fullName: 'Emiliano Ramírez Soto', curp: 'RASE130705HDFRMT05', grade: '1A', status: 'inactive' },
  ];
  const students = await Promise.all(studentPayloads.map((p) => upsertStudent(studentRepo, p)));
  logger.info(`Seeded ${students.length} students`);

  // ── Parent-Student links ──
  const psRepo = appDataSource.getRepository(ParentStudent);
  const linkPairs: [number, number][] = [
    [users[2].id, students[0].id], // Carlos → Pedro
    [users[2].id, students[1].id], // Carlos → Sofía
    [users[3].id, students[2].id], // Ana → Diego
    [users[3].id, students[3].id], // Ana → Valentina
  ];
  await Promise.all(linkPairs.map(([userId, studentId]) => upsertParentStudent(psRepo, userId, studentId)));
  logger.info(`Seeded ${linkPairs.length} parent-student links`);

  // ── Document Categories ──
  const categoryRepo = appDataSource.getRepository(DocumentCategory);
  const categoryPayloads: [string, string][] = [
    ['Acta de nacimiento', 'Acta de nacimiento del estudiante'],
    ['CURP', 'Constancia de CURP'],
    ['Boleta de calificaciones', 'Boleta del ciclo escolar'],
    ['Constancia médica', 'Certificado médico o cartilla de vacunación'],
    ['Comprobante de domicilio', 'Recibo de luz, agua o teléfono reciente'],
    ['Identificación del tutor', 'INE o pasaporte del padre/tutor'],
  ];
  await Promise.all(categoryPayloads.map(([name, desc]) => upsertDocumentCategory(categoryRepo, name, desc)));
  logger.info(`Seeded ${categoryPayloads.length} document categories`);

  logger.info('Seed completed successfully');
  await appDataSource.destroy();
}

seed().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
