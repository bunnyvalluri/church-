/**
 * frontend/lib/email/providers/smtp.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SMTP Delivery Provider (Gmail App Passwords or Custom SMTP Server)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import nodemailer from 'nodemailer';
import { IEmailProvider, ProviderHealthReport } from './email.provider.interface';
import { EmailSendOptions, EmailSendResult } from '../email.types';
import { emailConfig } from '../email.config';
import { classifyEmailError } from '../email.errors';
import { logger } from '@/lib/logger';

export class SmtpProvider implements IEmailProvider {
  public readonly name = 'smtp' as const;
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
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
        });
      } catch (err: any) {
        logger.warn('[EMAIL/SMTP] Failed to initialize SMTP transporter:', { error: err.message });
      }
    }
  }

  public isConfigured(): boolean {
    return this.transporter !== null;
  }

  public async verifyConfiguration(): Promise<{ valid: boolean; reason?: string }> {
    if (!this.transporter) {
      return { valid: false, reason: 'SMTP credentials (user/password) not configured.' };
    }
    try {
      await this.transporter.verify();
      return { valid: true };
    } catch (err: any) {
      return { valid: false, reason: err.message || 'SMTP transporter verification failed.' };
    }
  }

  public async healthCheck(): Promise<ProviderHealthReport> {
    const start = Date.now();
    if (!this.transporter) {
      return {
        healthy: false,
        latencyMs: 0,
        provider: this.name,
        message: 'SMTP credentials not configured in environment.',
      };
    }

    try {
      await this.transporter.verify();
      const latencyMs = Date.now() - start;
      return {
        healthy: true,
        latencyMs,
        provider: this.name,
        message: `SMTP connection established to ${emailConfig.providers.smtp.host}:${emailConfig.providers.smtp.port}`,
      };
    } catch (err: any) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        provider: this.name,
        message: err.message || 'Failed connecting to SMTP relay server.',
      };
    }
  }

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const startTime = Date.now();
    if (!this.transporter) {
      return {
        success: false,
        provider: this.name,
        errorCode: 'INVALID_CREDENTIALS',
        error: 'SMTP credentials (user/password) not configured.',
        durationMs: 0,
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

      const durationMs = Date.now() - startTime;
      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const classified = classifyEmailError(err);
      logger.error('[EMAIL/SMTP] SendMail error:', { error: err.message, code: classified.errorCode });
      return {
        success: false,
        provider: this.name,
        error: err.message || 'Unknown SMTP error occurred',
        errorCode: classified.errorCode,
        httpStatus: classified.httpStatus,
        durationMs,
      };
    }
  }
}
