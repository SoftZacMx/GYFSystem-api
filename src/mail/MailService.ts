import nodemailer, { type Transporter } from 'nodemailer';
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

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
}

export class MailService {
  private transporter: Transporter;
  private from: string;

  constructor(config: MailConfig) {
    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: config.user
        ? { user: config.user, pass: config.pass }
        : undefined,
    });
  }

  private getTransporter(smtpConfig?: MailConfig | null): { transporter: Transporter; from: string } {
    if (smtpConfig) {
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.port === 465,
        auth: smtpConfig.user ? { user: smtpConfig.user, pass: smtpConfig.pass } : undefined,
      });
      return { transporter, from: smtpConfig.from };
    }
    return { transporter: this.transporter, from: this.from };
  }

  async sendNotificationEmail(to: string, data: NotificationEmailData, smtpConfig?: MailConfig | null): Promise<void> {
    const subject = notificationEmailSubject(data);
    const html = notificationEmailHtml(data);
    const text = notificationEmailText(data);
    const { transporter, from } = this.getTransporter(smtpConfig);

    logger.info({ to, subject, type: data.type }, 'Attempting to send notification email…');

    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
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

  async sendVerificationEmail(to: string, data: VerificationEmailData, smtpConfig?: MailConfig | null): Promise<void> {
    const subject = verificationEmailSubject(data);
    const html = verificationEmailHtml(data);
    const text = verificationEmailText(data);
    const { transporter, from } = this.getTransporter(smtpConfig);
    logger.info({ to, subject }, 'Sending account verification email');
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
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

  async sendAccountActivatedEmail(to: string, data: AccountActivatedEmailData, smtpConfig?: MailConfig | null): Promise<void> {
    const subject = accountActivatedEmailSubject(data);
    const html = accountActivatedEmailHtml(data);
    const text = accountActivatedEmailText(data);
    const { transporter, from } = this.getTransporter(smtpConfig);
    logger.info({ to, subject }, 'Sending account activated email');
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
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

  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData, smtpConfig?: MailConfig | null): Promise<void> {
    const subject = passwordResetEmailSubject(data);
    const html = passwordResetEmailHtml(data);
    const text = passwordResetEmailText(data);
    const { transporter, from } = this.getTransporter(smtpConfig);
    logger.info({ to, subject }, 'Sending password reset email');
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
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
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified');
      return true;
    } catch (err) {
      logger.warn({ err }, 'SMTP connection could not be verified');
      return false;
    }
  }
}
