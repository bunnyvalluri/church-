/**
 * frontend/lib/email/email.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Transactional Email Service for Kingdom of Christ Ministries
 * 
 * Features:
 *   • Single source of truth for all transactional email operations
 *   • Memory + DB sliding-window idempotency cache to eliminate duplicate sends
 *   • Multi-transport provider abstraction (Resend -> SMTP -> Mock)
 *   • Robust database audit logging via Neon PostgreSQL (NotificationLog)
 *   • Zero leakage of passwords, tokens, or sensitive financial data
 *   • Bounded timeout promise execution to avoid serverless function freezes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { emailConfig } from './email.config';
import {
  EmailTemplateType,
  SendTemplateOptions,
  EmailSendResult,
  TemplateDataMap,
} from './email.types';
import { renderEmailTemplate } from './email.templates';
import { getEmailProvider } from './providers';

// ── In-Memory Idempotency Cache (3-minute sliding window) ─────────────────────
interface IdempotencyEntry {
  timestamp: number;
  messageId?: string;
}

const sentCache = new Map<string, IdempotencyEntry>();

function cleanupCache(): void {
  const now = Date.now();
  const ttl = emailConfig.reliability.deduplicationTtlMs;
  for (const [key, entry] of sentCache.entries()) {
    if (now - entry.timestamp > ttl) {
      sentCache.delete(key);
    }
  }
}

function checkAndRegisterIdempotency(key: string): boolean {
  cleanupCache();
  const normalized = key.toLowerCase().trim();
  const now = Date.now();
  const existing = sentCache.get(normalized);

  if (existing && now - existing.timestamp < emailConfig.reliability.deduplicationTtlMs) {
    return false; // Already sent within window
  }

  sentCache.set(normalized, { timestamp: now });
  return true;
}

// ── Central Email Service Class ──────────────────────────────────────────────
export class EmailService {
  /**
   * Dispatches a templated email with automatic idempotency check, template
   * rendering, multi-transport delivery, and PostgreSQL notification log creation.
   */
  public async send<T extends EmailTemplateType>(
    options: SendTemplateOptions<T>
  ): Promise<EmailSendResult & { logId?: string; deduplicated?: boolean }> {
    const { template, to, data, userId, eventId, donationId, receiptId, forceSend } = options;
    const sanitizedEmail = (to || '').toLowerCase().trim();

    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      logger.warn('[EMAIL/SERVICE] Aborted send: Missing or invalid recipient email', {
        template,
        recipient: sanitizedEmail,
      });
      return {
        success: false,
        provider: 'mock',
        error: 'Invalid recipient email address.',
      };
    }

    // 1. Idempotency Deduplication Guard
    const uniqueScope = eventId || donationId || receiptId || '';
    const deduplicationKey = `${sanitizedEmail}:${template}:${uniqueScope}`;

    if (!forceSend && !checkAndRegisterIdempotency(deduplicationKey)) {
      logger.info(
        `[EMAIL/SERVICE] Skipped duplicate send for ${sanitizedEmail} (${template}) within deduplication window.`,
        { template, recipient: sanitizedEmail }
      );
      return {
        success: true,
        provider: 'mock',
        deduplicated: true,
      };
    }

    // 2. Render Template
    let rendered;
    try {
      rendered = renderEmailTemplate(template, data);
    } catch (renderErr: any) {
      logger.error(`[EMAIL/SERVICE] Failed to render template ${template}:`, {
        error: renderErr.message,
      });
      return {
        success: false,
        provider: 'mock',
        error: `Template render error: ${renderErr.message}`,
      };
    }

    // 3. Dispatch via Multi-Transport Provider (with bounded timeout)
    const provider = getEmailProvider();
    const timeoutMs = emailConfig.reliability.sendTimeoutMs;

    let dispatchResult: EmailSendResult;
    try {
      const sendPromise = provider.send({
        to: sanitizedEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo: emailConfig.church.supportEmail,
        from: emailConfig.sender.formattedFrom,
        tags: [
          { name: 'template', value: template },
          { name: 'system', value: 'kcm-email-system' },
        ],
      });

      const timeoutPromise = new Promise<EmailSendResult>((resolve) =>
        setTimeout(
          () =>
            resolve({
              success: false,
              provider: provider.getActiveProviderName(),
              error: `Dispatch timed out after ${timeoutMs}ms`,
            }),
          timeoutMs
        )
      );

      dispatchResult = await Promise.race([sendPromise, timeoutPromise]);
    } catch (dispatchErr: any) {
      logger.error('[EMAIL/SERVICE] Unexpected exception during provider dispatch:', {
        error: dispatchErr.message,
      });
      dispatchResult = {
        success: false,
        provider: provider.getActiveProviderName(),
        error: dispatchErr.message || 'Dispatch exception',
      };
    }

    // 4. Safe Database Audit Logging in Neon PostgreSQL
    let logId: string | undefined;
    try {
      // Ensure we NEVER serialize passwords, auth tokens, or card numbers
      const sanitizedMetadata = {
        template,
        eventId: eventId || undefined,
        donationId: donationId || undefined,
        receiptId: receiptId || undefined,
        sandboxRedirected: dispatchResult.sandboxRedirected || undefined,
        provider: dispatchResult.provider,
      };

      const logRecord = await prisma.notificationLog.create({
        data: {
          channel: 'EMAIL',
          status: dispatchResult.success ? 'SENT' : 'FAILED',
          template: template,
          subject: rendered.subject,
          recipient_addr: sanitizedEmail,
          recipientId: userId || null,
          donationId: donationId || null,
          receiptId: receiptId || null,
          providerMessageId: dispatchResult.messageId || null,
          errorMessage: dispatchResult.error || null,
          metadata: JSON.stringify(sanitizedMetadata),
          deliveredAt: dispatchResult.success ? new Date() : null,
        },
      });

      logId = logRecord.id;
    } catch (dbErr: any) {
      // Non-fatal if DB logging encounters an issue; log to structured console logger
      logger.warn('[EMAIL/SERVICE] Failed to write notification log to database:', {
        error: dbErr.message,
      });
    }

    // Update sentCache with actual provider messageId
    if (dispatchResult.success && dispatchResult.messageId) {
      const entry = sentCache.get(deduplicationKey.toLowerCase());
      if (entry) {
        entry.messageId = dispatchResult.messageId;
      }
    }

    logger.info(`[EMAIL/SERVICE] ${dispatchResult.success ? '✓ Sent' : '✗ Failed'}: [${template}] to ${sanitizedEmail}`, {
      template,
      recipient: sanitizedEmail,
      provider: dispatchResult.provider,
      messageId: dispatchResult.messageId,
      success: dispatchResult.success,
    });

    return {
      ...dispatchResult,
      logId,
    };
  }

  // ── Convenience Wrappers for Standard Flows ────────────────────────────────

  public async sendWelcomeEmail(email: string, firstName?: string, visitUrl?: string, userId?: string) {
    return this.send({
      template: 'WELCOME',
      to: email,
      userId,
      data: {
        email,
        firstName,
        visitUrl,
      },
    });
  }

  public async sendLoginNotification(
    email: string,
    name?: string | null,
    details?: {
      loginDateTime?: string;
      loginMethod?: string;
      device?: string;
      browser?: string;
      ipAddress?: string;
      approxLocation?: string;
    },
    userId?: string
  ) {
    return this.send({
      template: 'LOGIN_ALERT',
      to: email,
      userId,
      data: {
        email,
        fullName: name || undefined,
        ...details,
      },
    });
  }

  public async sendEmailVerification(email: string, verificationUrl: string, firstName?: string, expirationTime?: string) {
    return this.send({
      template: 'EMAIL_VERIFICATION',
      to: email,
      data: {
        email,
        firstName,
        verificationUrl,
        expirationTime,
      },
    });
  }

  public async sendPasswordReset(email: string, resetUrl: string, firstName?: string, expirationTime?: string) {
    return this.send({
      template: 'PASSWORD_RESET',
      to: email,
      data: {
        email,
        firstName,
        resetUrl,
        expirationTime,
      },
    });
  }

  public async sendPrayerConfirmation(
    email: string,
    data: { prayerRequestId: string; title?: string; category?: string; submittedAt?: string; firstName?: string },
    userId?: string
  ) {
    return this.send({
      template: 'PRAYER_CONFIRMATION',
      to: email,
      userId,
      data: {
        email,
        ...data,
      },
    });
  }

  public async sendPrayerStatusUpdate(
    email: string,
    data: { prayerRequestId: string; title?: string; status: string; pastoralNote?: string; firstName?: string },
    userId?: string
  ) {
    return this.send({
      template: 'PRAYER_STATUS_UPDATE',
      to: email,
      userId,
      data: {
        email,
        ...data,
      },
    });
  }

  public async sendDonationConfirmation(
    email: string,
    data: { donationAmount: string; transactionId: string; date: string; purpose?: string; paymentMethod?: string; firstName?: string },
    donationId?: string
  ) {
    return this.send({
      template: 'DONATION_CONFIRMATION',
      to: email,
      donationId,
      data: {
        email,
        ...data,
      },
    });
  }

  public async sendDonationReceipt(
    email: string,
    data: TemplateDataMap['DONATION_RECEIPT'],
    receiptId?: string
  ) {
    return this.send({
      template: 'DONATION_RECEIPT',
      to: email,
      receiptId,
      data,
    });
  }

  /**
   * Retries a previously failed email log by ID.
   */
  public async retryFailedEmail(logId: string): Promise<EmailSendResult> {
    const log = await prisma.notificationLog.findUnique({ where: { id: logId } });
    if (!log || !log.recipient_addr) {
      return {
        success: false,
        provider: 'mock',
        error: 'Notification log not found or recipient missing.',
      };
    }

    const templateType = (log.template as EmailTemplateType) || 'WELCOME';
    let metadata: any = {};
    try {
      if (log.metadata) metadata = JSON.parse(log.metadata);
    } catch {
      /* ignore */
    }

    // Reconstruct minimal payload
    const data: any = {
      email: log.recipient_addr,
      ...(metadata.data || {}),
    };

    const result = await this.send({
      template: templateType,
      to: log.recipient_addr,
      data,
      userId: log.recipientId || undefined,
      forceSend: true,
    });

    // Update retry count and status in DB
    await prisma.notificationLog.update({
      where: { id: logId },
      data: {
        retryCount: { increment: 1 },
        status: result.success ? 'SENT' : 'FAILED',
        errorMessage: result.error || null,
        deliveredAt: result.success ? new Date() : null,
      },
    }).catch(() => {});

    return result;
  }
}

// ── Singleton Instance Export ────────────────────────────────────────────────
let _sharedEmailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!_sharedEmailService) {
    _sharedEmailService = new EmailService();
  }
  return _sharedEmailService;
}

export const emailService = getEmailService();
