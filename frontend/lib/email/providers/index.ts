/**
 * frontend/lib/email/providers/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider Factory and Resilient Fallback Engine
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { IEmailProvider } from './email.provider.interface';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { MockProvider } from './mock.provider';
import { EmailSendOptions, EmailSendResult, EmailProviderName } from '../email.types';
import { emailConfig } from '../email.config';
import { logger } from '@/lib/logger';

export class CompositeEmailProvider implements IEmailProvider {
  public readonly name: EmailProviderName = 'resend';
  private resendProvider = new ResendProvider();
  private smtpProvider = new SmtpProvider();
  private mockProvider = new MockProvider();

  public isConfigured(): boolean {
    return this.resendProvider.isConfigured() || this.smtpProvider.isConfigured();
  }

  public getActiveProviderName(): EmailProviderName {
    const preference = emailConfig.providers.active;
    if (preference === 'mock') return 'mock';
    if (preference === 'smtp' && this.smtpProvider.isConfigured()) return 'smtp';
    if (this.resendProvider.isConfigured()) return 'resend';
    if (this.smtpProvider.isConfigured()) return 'smtp';
    return 'mock';
  }

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const preference = emailConfig.providers.active;

    // 1. Explicit Mock Mode
    if (preference === 'mock') {
      return this.mockProvider.send(options);
    }

    // 2. Explicit SMTP Preference
    if (preference === 'smtp') {
      if (this.smtpProvider.isConfigured()) {
        const res = await this.smtpProvider.send(options);
        if (res.success) return res;
        logger.warn(`[EMAIL/PROVIDER] SMTP failed (${res.error}). Attempting Resend fallback.`);
      }
      if (this.resendProvider.isConfigured()) {
        return this.resendProvider.send(options);
      }
      return this.mockProvider.send(options);
    }

    // 3. Default: Primary Resend -> Fallback SMTP -> Mock
    if (this.resendProvider.isConfigured()) {
      const res = await this.resendProvider.send(options);
      if (res.success) return res;
      logger.warn(`[EMAIL/PROVIDER] Resend failed (${res.error}). Attempting SMTP fallback.`);
    }

    if (this.smtpProvider.isConfigured()) {
      const res = await this.smtpProvider.send(options);
      if (res.success) return res;
      logger.warn(`[EMAIL/PROVIDER] SMTP fallback failed (${res.error}). Falling back to mock.`);
    }

    // Safe development / offline fallback
    return this.mockProvider.send(options);
  }
}

let _sharedProvider: CompositeEmailProvider | null = null;

export function getEmailProvider(): CompositeEmailProvider {
  if (!_sharedProvider) {
    _sharedProvider = new CompositeEmailProvider();
  }
  return _sharedProvider;
}

export * from './email.provider.interface';
export * from './resend.provider';
export * from './smtp.provider';
export * from './mock.provider';
