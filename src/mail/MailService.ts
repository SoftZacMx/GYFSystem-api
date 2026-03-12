import { SendEmailCommand, type SESClient } from '@aws-sdk/client-ses';
import { logger } from '../config';
import {
  notificationEmailSubject,
  notificationEmailHtml,
  notificationEmailText,
  type NotificationEmailData,
  verificationEmailSubject,
  verificationEmailHtml,
  verificationEmailText,
  type VerificationEmailData,
  accountActivatedEmailSubject,
  accountActivatedEmailHtml,
  accountActivatedEmailText,
  type AccountActivatedEmailData,
  passwordResetEmailSubject,
  passwordResetEmailHtml,
  passwordResetEmailText,
  type PasswordResetEmailData,
} from './templates';

const SES_NOT_CONFIGURED = 'El envío de correo es solo por AWS SES; configure AWS_SES_ENABLED=true y las credenciales S3 (IAM con permiso ses:SendEmail).';

export interface MailConfig {
  /** Remitente por defecto (o el de Company en BD). Debe ser identidad verificada en SES. */
  from: string;
  /** Cliente SES (creado cuando AWS_SES_ENABLED=true y hay S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY). */
  sesClient: SESClient | null;
  /** Región de SES. */
  sesRegion: string;
}

export class MailService {
  private from: string;
  private sesClient: SESClient | null;
  private sesRegion: string;

  constructor(config: MailConfig) {
    this.from = config.from;
    this.sesClient = config.sesClient ?? null;
    this.sesRegion = config.sesRegion ?? 'us-east-1';
  }

  private async sendViaSES(to: string, from: string, subject: string, html: string, text: string): Promise<{ messageId: string }> {
    if (!this.sesClient) {
      throw new Error('SES client not configured');
    }
    const command = new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: html, Charset: 'UTF-8' },
          Text: { Data: text || html.replace(/<[^>]+>/g, ''), Charset: 'UTF-8' },
        },
      },
    });
    const result = await this.sesClient.send(command);
    return { messageId: result.MessageId ?? '' };
  }

  private async sendMail(to: string, from: string, subject: string, html: string, text: string): Promise<{ messageId?: string; accepted?: string[]; rejected?: string[] }> {
    if (!this.sesClient) {
      throw new Error(SES_NOT_CONFIGURED);
    }
    const info = await this.sendViaSES(to, from, subject, html, text);
    return { messageId: info.messageId, accepted: [to], rejected: [] };
  }

  async sendNotificationEmail(to: string, data: NotificationEmailData, _smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = notificationEmailSubject(data);
    const html = notificationEmailHtml(data);
    const text = notificationEmailText(data);
    const from = companyFrom ?? this.from;

    logger.info({ to, subject, type: data.type }, 'Attempting to send notification email…');

    try {
      const info = await this.sendMail(to, from, subject, html, text);
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Notification email sent successfully',
      );
      logger.info({ to, subject }, 'Correo enviado correctamente');
    } catch (err) {
      logger.error({ err, to, subject, message: err instanceof Error ? err.message : String(err) }, 'Failed to send notification email');
      logger.error({ to, subject }, 'Error al enviar correo');
    }
  }

  async sendVerificationEmail(to: string, data: VerificationEmailData, _smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = verificationEmailSubject(data);
    const html = verificationEmailHtml(data);
    const text = verificationEmailText(data);
    const from = companyFrom ?? this.from;
    logger.info({ to, subject }, 'Sending account verification email');
    try {
      const info = await this.sendMail(to, from, subject, html, text);
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Verification email sent successfully',
      );
      logger.info({ to, subject }, 'Correo enviado correctamente');
    } catch (err) {
      logger.error({ err, to, subject, message: err instanceof Error ? err.message : String(err) }, 'Failed to send verification email');
      logger.error({ to, subject }, 'Error al enviar correo');
      throw err;
    }
  }

  async sendAccountActivatedEmail(to: string, data: AccountActivatedEmailData, _smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = accountActivatedEmailSubject(data);
    const html = accountActivatedEmailHtml(data);
    const text = accountActivatedEmailText(data);
    const from = companyFrom ?? this.from;
    logger.info({ to, subject }, 'Sending account activated email');
    try {
      const info = await this.sendMail(to, from, subject, html, text);
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Account activated email sent successfully',
      );
      logger.info({ to, subject }, 'Correo enviado correctamente');
    } catch (err) {
      logger.error({ err, to, subject, message: err instanceof Error ? err.message : String(err) }, 'Failed to send account activated email');
      logger.error({ to, subject }, 'Error al enviar correo');
      throw err;
    }
  }

  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData, _smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = passwordResetEmailSubject(data);
    const html = passwordResetEmailHtml(data);
    const text = passwordResetEmailText(data);
    const from = companyFrom ?? this.from;
    logger.info({ to, subject }, 'Sending password reset email');
    try {
      const info = await this.sendMail(to, from, subject, html, text);
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Password reset email sent successfully',
      );
      logger.info({ to, subject }, 'Correo enviado correctamente');
    } catch (err) {
      logger.error({ err, to, subject, message: err instanceof Error ? err.message : String(err) }, 'Failed to send password reset email');
      logger.error({ to, subject }, 'Error al enviar correo');
      throw err;
    }
  }

  async verify(): Promise<boolean> {
    if (this.sesClient) {
      logger.info('AWS SES configured');
      return true;
    }
    logger.warn('AWS SES not configured; email sending will fail until AWS_SES_ENABLED and S3 credentials are set');
    return false;
  }
}
