import 'dotenv/config';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(3306),
    DB_USER: z.string().default('root'),
    DB_PASSWORD: z.string().default(''),
    DB_NAME: z.string().default('files_manager'),
    JWT_SECRET: z.string().default('dev-secret-do-not-use-in-production'),
    CORS_ORIGIN: z.string().default('*'),

  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('files-manager-dev'),
  S3_ACCESS_KEY_ID: z.string().default(''),
  S3_SECRET_ACCESS_KEY: z.string().default(''),
  S3_ENDPOINT: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(false),

  SIGNATURE_PRIVATE_KEY_PATH: z.string().default('./keys/private.pem'),
  SIGNATURE_PUBLIC_KEY_PATH: z.string().default('./keys/public.pem'),
  APP_URL: z.string().default('http://localhost:5173'),

  /** Remitente por defecto (o el de Company en BD). Debe ser identidad verificada en SES. */
  SMTP_FROM: z.string().default('Files Manager <noreply@filesmanager.local>'),

  /** El envío de correo es solo por AWS SES. Si true, se crea el cliente SES con las credenciales S3 (S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY). El usuario IAM debe tener permiso ses:SendEmail. */
  AWS_SES_ENABLED: z.coerce.boolean().default(false),
  /** Región de SES (ej. us-east-1). Si no se define, se usa S3_REGION. */
  AWS_SES_REGION: z.string().optional(),

  /** Clave para cifrar SMTP_PASS en company (mín. 32 caracteres en producción). */
  ENCRYPTION_KEY: z.string().default('dev-encryption-key-min-32-chars!!'),
  })
  .refine(
    (data) => data.NODE_ENV !== 'production' || data.JWT_SECRET.length >= 32,
    { message: 'JWT_SECRET must be at least 32 characters in production', path: ['JWT_SECRET'] }
  );

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment: ${JSON.stringify(message)}`);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
