/**
 * frontend/lib/email/providers/smtp.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SMTP Delivery Provider (Gmail App Passwords or Custom SMTP Server)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import nodemailer from 'nodemailer';
import { IEmailProvider } from './email.provider.interface';
import { EmailSendOptions, EmailSendResult } from '../email.types';
import { emailConfig } from '../email.config';
import { logger } from '@/lib/logger';

export class SmtpProvider implements IEmailProvider {
  public readonly name = 'smtp';
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const { host, port, secure, user, pass } = emailConfig.providers.smtp;
    if (user && pass && pass.trim().length > 0) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });
      } catch (err: any) {
        logger.warn('[EMAIL/SMTP] Failed to initialize SMTP transporter:', { error: err.message });
      }
    }
  }

  public isConfigured(): boolean {
    return this.transporter !== null;
  }

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    if (!this.transporter) {
      return {
        success: false,
        provider: this.name,
        error: 'SMTP credentials (user/password) not configured.',
      };
    }

    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const from = options.from || emailConfig.sender.formattedFrom;
    const replyTo = options.replyTo || emailConfig.sender.replyTo;

    try {
      const info = await this.transporter.sendMail({
        from,
        to: recipients,
        replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
      };
    } catch (err: any) {
      logger.error('[EMAIL/SMTP] SendMail error:', { error: err.message });
      return {
        success: false,
        provider: this.name,
        error: err.message || 'Unknown SMTP error occurred',
      };
    }
  }
}
