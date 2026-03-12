import { SESClient } from '@aws-sdk/client-ses';
import { env } from './env';

/** Región usada para SES (AWS_SES_REGION o S3_REGION). */
export const sesRegion = env.AWS_SES_REGION ?? env.S3_REGION;

/**
 * Cliente SES cuando hay credenciales S3 (el correo se envía solo por AWS SES).
 * El usuario IAM debe tener permiso ses:SendEmail.
 */
export function createSESClient(): SESClient | null {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    return null;
  }
  return new SESClient({
    region: sesRegion,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
}

export const sesClient = createSESClient();
