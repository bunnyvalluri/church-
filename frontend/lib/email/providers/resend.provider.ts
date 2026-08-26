/**
 * frontend/lib/email/providers/resend.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Resend Email Delivery Provider with Smart Sandbox Fallback
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Resend } from 'resend';
import { IEmailProvider } from './email.provider.interface';
import { EmailSendOptions, EmailSendResult } from '../email.types';
import { emailConfig } from '../email.config';
import { logger } from '@/lib/logger';

export class ResendProvider implements IEmailProvider {
  public readonly name = 'resend';
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

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    if (!this.client) {
      return {
        success: false,
        provider: this.name,
        error: 'Resend API key not configured or invalid.',
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

      if ((response as any)?.error) {
        const errorObj = (response as any).error;
        const errorMsg = errorObj?.message || 'Unknown Resend error';

        // ── Handle Resend Sandbox restriction (when domain is unverified on onboarding@resend.dev)
        if (
          errorObj?.statusCode === 403 ||
          errorMsg.includes('only send testing emails to your own email address') ||
          errorMsg.includes('testing emails')
        ) {
          const fallbackOwner = emailConfig.providers.resend.fallbackOwner;
          logger.warn(
            `[EMAIL/RESEND] Sandbox restriction encountered for "${recipients.join(
              ', '
            )}". Dispatching to test owner "${fallbackOwner}". To send to any inbox, verify your domain at resend.com/domains.`,
            { originalRecipients: recipients, fallbackOwner }
          );

          // Deliver sandbox preview to test owner
          const sandboxSubject = `[Sandbox Preview for ${recipients.join(', ')}] ${options.subject}`;
          const sandboxHtml = options.html.replace(
            '<body style="margin: 0; padding: 0;',
            `<body style="margin: 0; padding: 0;"><div style="background-color:#fef3c7;color:#92400e;padding:10px 16px;text-align:center;font-size:12px;font-weight:bold;border-bottom:1px solid #fde68a;">⚠️ DEV SANDBOX NOTICE: Intended for ${recipients.join(', ')} — delivered to verified owner mailbox.</div>`
          );

          const fallbackRes = await this.client.emails.send({
            from,
            to: [fallbackOwner],
            replyTo,
            subject: sandboxSubject,
            html: sandboxHtml,
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
            };
          }
        }

        return {
          success: false,
          provider: this.name,
          error: errorMsg,
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
        provider: this.name,
      };
    } catch (err: any) {
      logger.error('[EMAIL/RESEND] Exception during dispatch:', { error: err?.message || err });
      return {
        success: false,
        provider: this.name,
        error: err?.message || 'Exception sending email via Resend',
      };
    }
  }
}
