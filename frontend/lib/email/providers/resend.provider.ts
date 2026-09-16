/**
 * frontend/lib/email/providers/resend.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Resend Email Delivery Provider with Verified Production Security
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Resend } from 'resend';
import { IEmailProvider, ProviderHealthReport } from './email.provider.interface';
import { EmailSendOptions, EmailSendResult } from '../email.types';
import { emailConfig } from '../email.config';
import { classifyEmailError } from '../email.errors';
import { logger } from '@/lib/logger';

export class ResendProvider implements IEmailProvider {
  public readonly name = 'resend' as const;
  private client: Resend | null = null;

  constructor() {
    const apiKey = emailConfig.providers.resend.apiKey;
    if (apiKey && apiKey.trim().length > 0 && !apiKey.startsWith('your_') && !apiKey.startsWith('re_your')) {
      try {
        this.client = new Resend(apiKey.trim());
      } catch (err: any) {
        logger.warn('[EMAIL/RESEND] Failed to initialize Resend client:', { error: err.message });
      }
    }
  }

  public isConfigured(): boolean {
    return this.client !== null;
  }

  public async verifyConfiguration(): Promise<{ valid: boolean; reason?: string }> {
    if (!this.client) {
      return { valid: false, reason: 'Resend API key is missing or not configured.' };
    }
    try {
      const domainsRes = await this.client.domains.list();
      if ((domainsRes as any)?.error) {
        return { valid: false, reason: (domainsRes as any).error.message };
      }
      return { valid: true };
    } catch (err: any) {
      return { valid: false, reason: err.message || 'Exception verifying Resend API key.' };
    }
  }

  public async healthCheck(): Promise<ProviderHealthReport> {
    const start = Date.now();
    if (!this.client) {
      return {
        healthy: false,
        latencyMs: 0,
        provider: this.name,
        message: 'Resend API key is not configured in environment.',
      };
    }

    try {
      const domainsRes = await this.client.domains.list();
      const latencyMs = Date.now() - start;

      if ((domainsRes as any)?.error) {
        return {
          healthy: false,
          latencyMs,
          provider: this.name,
          message: (domainsRes as any).error.message,
          details: (domainsRes as any).error,
        };
      }

      const domainList = (domainsRes as any)?.data?.data || [];
      const hasVerifiedDomain = domainList.some((d: any) => d.status === 'verified');

      return {
        healthy: true,
        latencyMs,
        provider: this.name,
        message: hasVerifiedDomain
          ? 'Resend API connection healthy with verified domain(s).'
          : 'Resend API connected, but no custom domain is verified (restricted to test owner).',
        details: {
          domainsCount: domainList.length,
          hasVerifiedDomain,
          domains: domainList.map((d: any) => ({ name: d.name, status: d.status })),
        },
      };
    } catch (err: any) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        provider: this.name,
        message: err.message || 'Failed connecting to Resend API endpoint.',
      };
    }
  }

  public async getDeliveryStatus(providerMessageId: string): Promise<string | null> {
    if (!this.client || !providerMessageId) return null;
    try {
      const emailInfo = await this.client.emails.get(providerMessageId);
      if ((emailInfo as any)?.data) {
        return (emailInfo as any).data.last_event || 'SENT';
      }
      return null;
    } catch {
      return null;
    }
  }

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const startTime = Date.now();
    if (!this.client) {
      return {
        success: false,
        provider: this.name,
        errorCode: 'INVALID_CREDENTIALS',
        error: 'Resend API key not configured or invalid.',
        durationMs: 0,
      };
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const from = options.from || emailConfig.sender.formattedFrom;
    const replyTo = options.replyTo || emailConfig.sender.replyTo;

    try {
      const response = await this.client.emails.send({
        from,
        to: recipients,
        replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        tags: options.tags,
      });

      const durationMs = Date.now() - startTime;

      if ((response as any)?.error) {
        const errorObj = (response as any).error;
        const errorMsg = errorObj?.message || 'Unknown Resend error';
        const classified = classifyEmailError(errorObj);

        // ── IN PRODUCTION & STAGING: Strictly NEVER redirect or add sandbox notices.
        // Return clear, truthful failure for alerting and failover.
        if (emailConfig.environment.isProduction || emailConfig.environment.isStaging) {
          logger.warn(
            `[EMAIL/RESEND] Resend rejected delivery (${errorMsg}). Returning failure for multi-transport failover.`,
            { originalRecipients: recipients, error: errorMsg, code: classified.errorCode }
          );
          return {
            success: false,
            provider: this.name,
            error: errorMsg,
            errorCode: classified.errorCode,
            httpStatus: classified.httpStatus,
            durationMs,
          };
        }

        // ── IN LOCAL DEVELOPMENT ONLY: Safely preview to developer mailbox if restricted
        if (classified.errorCode === 'UNVERIFIED_DOMAIN' || classified.errorCode === 'SANDBOX_RESTRICTION') {
          const fallbackOwner = emailConfig.providers.resend.fallbackOwner;
          logger.warn(
            `[EMAIL/RESEND] [LOCAL DEV] Sandbox restriction encountered for "${recipients.join(
              ', '
            )}". Dispatching preview to test owner "${fallbackOwner}".`,
            { originalRecipients: recipients, fallbackOwner }
          );

          const sandboxSubject = `[Sandbox Preview for ${recipients.join(', ')}] ${options.subject}`;

          const fallbackRes = await this.client.emails.send({
            from,
            to: [fallbackOwner],
            replyTo,
            subject: sandboxSubject,
            html: options.html,
            text: options.text,
          });

          if (!(fallbackRes as any)?.error) {
            return {
              success: true,
              messageId: fallbackRes.data?.id,
              provider: this.name,
              sandboxRedirected: true,
              originalRecipient: recipients.join(', '),
              fallbackRecipient: fallbackOwner,
              durationMs: Date.now() - startTime,
            };
          }
        }

        return {
          success: false,
          provider: this.name,
          error: errorMsg,
          errorCode: classified.errorCode,
          httpStatus: classified.httpStatus,
          durationMs,
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
        provider: this.name,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const classified = classifyEmailError(err);
      logger.error('[EMAIL/RESEND] Exception during dispatch:', { error: err?.message || err });
      return {
        success: false,
        provider: this.name,
        error: err?.message || 'Exception sending email via Resend',
        errorCode: classified.errorCode,
        httpStatus: classified.httpStatus,
        durationMs,
      };
    }
  }
}
