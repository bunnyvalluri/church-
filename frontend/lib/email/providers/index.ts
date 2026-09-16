/**
 * frontend/lib/email/providers/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider Factory and Resilient Fallback Engine
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { IEmailProvider, ProviderHealthReport } from './email.provider.interface';
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
    if (this.resendProvider.isConfigured() || this.smtpProvider.isConfigured()) {
      return true;
    }
    return !emailConfig.environment.isProduction && this.mockProvider.isConfigured();
  }

  public getActiveProviderName(): EmailProviderName {
    const preference = emailConfig.providers.active;
    if (preference === 'mock') return 'mock';
    if (preference === 'smtp' && this.smtpProvider.isConfigured()) return 'smtp';
    if (this.resendProvider.isConfigured()) return 'resend';
    if (this.smtpProvider.isConfigured()) return 'smtp';
    return emailConfig.environment.isProduction ? 'resend' : 'mock';
  }

  public async verifyConfiguration(): Promise<{ valid: boolean; reason?: string }> {
    if (this.resendProvider.isConfigured()) {
      return this.resendProvider.verifyConfiguration();
    }
    if (this.smtpProvider.isConfigured()) {
      return this.smtpProvider.verifyConfiguration();
    }
    if (emailConfig.environment.isProduction) {
      return { valid: false, reason: 'No production email provider (Resend/SMTP) is configured.' };
    }
    return { valid: true };
  }

  public async healthCheck(): Promise<ProviderHealthReport> {
    const primary = this.getActiveProviderName();
    if (primary === 'resend') {
      return this.resendProvider.healthCheck();
    }
    if (primary === 'smtp') {
      return this.smtpProvider.healthCheck();
    }
    return this.mockProvider.healthCheck();
  }

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const preference = emailConfig.providers.active;
    const isProd = emailConfig.environment.isProduction;

    // 1. Explicit Mock Mode (Only valid in non-production or explicit testing)
    if (preference === 'mock') {
      if (isProd) {
        logger.error('[EMAIL/PROVIDER] Mock mode requested in production! Denying simulated delivery.');
        return {
          success: false,
          provider: 'mock',
          errorCode: 'INVALID_CREDENTIALS',
          error: 'Mock email provider cannot be used in production environment.',
        };
      }
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
      if (isProd) {
        return {
          success: false,
          provider: 'smtp',
          errorCode: 'INVALID_CREDENTIALS',
          error: 'SMTP provider failed and no fallback provider is available in production.',
        };
      }
      return this.mockProvider.send(options);
    }

    // 3. Default: Primary Resend -> Fallback SMTP -> (Fail in Prod, Mock in Dev)
    let lastError: EmailSendResult | null = null;

    if (this.resendProvider.isConfigured()) {
      const res = await this.resendProvider.send(options);
      if (res.success) return res;
      lastError = res;
      logger.warn(`[EMAIL/PROVIDER] Resend failed (${res.error} - ${res.errorCode}). Attempting SMTP fallback.`);
    }

    if (this.smtpProvider.isConfigured()) {
      const res = await this.smtpProvider.send(options);
      if (res.success) return res;
      lastError = res;
      logger.warn(`[EMAIL/PROVIDER] SMTP fallback failed (${res.error} - ${res.errorCode}).`);
    }

    // In Production: NEVER falsely mark as delivered via Mock!
    if (isProd) {
      return (
        lastError || {
          success: false,
          provider: 'resend',
          errorCode: 'INVALID_CREDENTIALS',
          error: 'All configured production email transports failed.',
        }
      );
    }

    // Safe development / offline fallback for local workstation development
    logger.info('[EMAIL/PROVIDER] Falling back to MockProvider in development environment.');
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
