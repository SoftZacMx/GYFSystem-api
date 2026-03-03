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

  async sendNotificationEmail(to: string, data: NotificationEmailData): Promise<void> {
    const subject = notificationEmailSubject(data);
    const html = notificationEmailHtml(data);
    const text = notificationEmailText(data);

    logger.info({ to, subject, type: data.type }, 'Attempting to send notification email…');

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Notification email sent successfully',
      );
    } catch (err) {
      logger.error({ err, to, subject }, 'Failed to send notification email');
    }
  }

  async sendVerificationEmail(to: string, data: VerificationEmailData): Promise<void> {
    const subject = verificationEmailSubject(data);
    const html = verificationEmailHtml(data);
    const text = verificationEmailText(data);
    logger.info({ to, subject }, 'Sending account verification email');
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Verification email sent successfully',
      );
    } catch (err) {
      logger.error({ err, to, subject }, 'Failed to send verification email');
      throw err;
    }
  }

  async sendAccountActivatedEmail(to: string, data: AccountActivatedEmailData): Promise<void> {
    const subject = accountActivatedEmailSubject(data);
    const html = accountActivatedEmailHtml(data);
    const text = accountActivatedEmailText(data);
    logger.info({ to, subject }, 'Sending account activated email');
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html,
        text,
      });
      logger.info(
        { messageId: info.messageId, to, subject, accepted: info.accepted, rejected: info.rejected },
        'Account activated email sent successfully',
      );
    } catch (err) {
      logger.error({ err, to, subject }, 'Failed to send account activated email');
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
