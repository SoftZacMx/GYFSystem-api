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

const RESEND_API_URL = 'https://api.resend.com/emails';

export interface MailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  /** Si está definido, se envía por Resend API (HTTPS) en lugar de SMTP. */
  resendApiKey?: string;
}

export class MailService {
  private transporter: Transporter;
  private from: string;
  private resendApiKey: string | undefined;

  constructor(config: MailConfig) {
    this.from = config.from;
    this.resendApiKey = config.resendApiKey;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: config.user
        ? { user: config.user, pass: config.pass }
        : undefined,
    });
  }

  private async sendViaResend(to: string, from: string, subject: string, html: string, text: string): Promise<{ messageId: string }> {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text: text || undefined,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      throw new Error(body.message ?? `Resend API ${res.status}: ${res.statusText}`);
    }
    return { messageId: body.id ?? '' };
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

  private async sendMail(
    to: string,
    from: string,
    subject: string,
    html: string,
    text: string,
    smtpConfig?: MailConfig | null
  ): Promise<{ messageId?: string; accepted?: string[]; rejected?: string[] }> {
    if (this.resendApiKey) {
      const info = await this.sendViaResend(to, from, subject, html, text);
      return { messageId: info.messageId, accepted: [to], rejected: [] };
    }
    const { transporter } = this.getTransporter(smtpConfig);
    const info = await transporter.sendMail({ from, to, subject, html, text });
    return { messageId: info.messageId, accepted: info.accepted as string[], rejected: info.rejected as string[] };
  }

  async sendNotificationEmail(to: string, data: NotificationEmailData, smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = notificationEmailSubject(data);
    const html = notificationEmailHtml(data);
    const text = notificationEmailText(data);
    const from = this.resendApiKey ? (companyFrom ?? this.from) : this.getTransporter(smtpConfig).from;

    logger.info({ to, subject, type: data.type }, 'Attempting to send notification email…');

    try {
      const info = await this.sendMail(to, from, subject, html, text, smtpConfig);
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

  async sendVerificationEmail(to: string, data: VerificationEmailData, smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = verificationEmailSubject(data);
    const html = verificationEmailHtml(data);
    const text = verificationEmailText(data);
    const from = this.resendApiKey ? (companyFrom ?? this.from) : this.getTransporter(smtpConfig).from;
    logger.info({ to, subject }, 'Sending account verification email');
    try {
      const info = await this.sendMail(to, from, subject, html, text, smtpConfig);
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

  async sendAccountActivatedEmail(to: string, data: AccountActivatedEmailData, smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = accountActivatedEmailSubject(data);
    const html = accountActivatedEmailHtml(data);
    const text = accountActivatedEmailText(data);
    const from = this.resendApiKey ? (companyFrom ?? this.from) : this.getTransporter(smtpConfig).from;
    logger.info({ to, subject }, 'Sending account activated email');
    try {
      const info = await this.sendMail(to, from, subject, html, text, smtpConfig);
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

  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData, smtpConfig?: MailConfig | null, companyFrom?: string | null): Promise<void> {
    const subject = passwordResetEmailSubject(data);
    const html = passwordResetEmailHtml(data);
    const text = passwordResetEmailText(data);
    const from = this.resendApiKey ? (companyFrom ?? this.from) : this.getTransporter(smtpConfig).from;
    logger.info({ to, subject }, 'Sending password reset email');
    try {
      const info = await this.sendMail(to, from, subject, html, text, smtpConfig);
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
    if (this.resendApiKey) {
      logger.info('Resend API key configured (skip SMTP verify)');
      return true;
    }
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
