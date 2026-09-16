/**
 * frontend/lib/email/email.service.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Transactional Email Service for Kingdom of Christ Ministries
 * 
 * Features:
 *   • Single source of truth for all transactional email operations
 *   • Deterministic DB + memory sliding-window idempotency cache
 *   • Multi-transport provider abstraction (Resend -> SMTP -> Dev Mock)
 *   • Dual-write audit logging via Neon PostgreSQL (EmailEvent + NotificationLog)
 *   • Controlled exponential backoff & jitter retry loop for transient failures
 *   • Zero leakage of passwords, tokens, or sensitive credentials
 *   • Bounded timeout execution to prevent Vercel Serverless Function freezes
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { emailConfig } from './email.config';
import {
  EmailTemplateType,
  SendTemplateOptions,
  EmailSendResult,
  TemplateDataMap,
  EmailDeliveryStatus,
} from './email.types';
import { classifyEmailError, calculateBackoffMs } from './email.errors';
import { renderEmailTemplate } from './email.templates';
import { getEmailProvider } from './providers';

// ── In-Memory Idempotency Cache (3-minute sliding window) ─────────────────────
interface IdempotencyEntry {
  timestamp: number;
  messageId?: string;
  emailEventId?: string;
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

function checkAndRegisterMemoryIdempotency(key: string): boolean {
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

// ── Privacy & Masking Helpers ────────────────────────────────────────────────
export function hashRecipient(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

export function maskEmail(email: string): string {
  const [local, domain] = (email || '').split('@');
  if (!domain) return email || 'unknown';
  if (local.length <= 2) return `${local[0] || '*'}*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local[local.length - 1]}@${domain}`;
}

export function generateDeterministicIdempotencyKey(
  email: string,
  template: string,
  scope?: string
): string {
  const raw = `${email.toLowerCase().trim()}:${template}:${scope || ''}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ── Central Email Service Class ──────────────────────────────────────────────
export class EmailService {
  /**
   * Dispatches a templated email with automatic idempotency check, template
   * rendering, multi-transport delivery, exponential retries, and PostgreSQL audit logging.
   */
  public async send<T extends EmailTemplateType>(
    options: SendTemplateOptions<T> & { securityEventId?: string }
  ): Promise<EmailSendResult & { logId?: string; emailEventId?: string; deduplicated?: boolean }> {
    const { template, to, data, userId, eventId, donationId, receiptId, forceSend, securityEventId } = options;
    const sanitizedEmail = (to || '').toLowerCase().trim();

    if (!sanitizedEmail || !sanitizedEmail.includes('@')) {
      logger.warn('[EMAIL/SERVICE] Aborted send: Missing or invalid recipient email', {
        template,
        recipient: sanitizedEmail,
      });
      return {
        success: false,
        provider: 'mock',
        errorCode: 'INVALID_RECIPIENT',
        error: 'Invalid recipient email address.',
      };
    }

    // 1. Deterministic Idempotency Key
    const uniqueScope = eventId || donationId || receiptId || securityEventId || '';
    const deduplicationKey = generateDeterministicIdempotencyKey(sanitizedEmail, template, uniqueScope);

    // In-memory guard
    if (!forceSend && !checkAndRegisterMemoryIdempotency(deduplicationKey)) {
      logger.info(
        `[EMAIL/SERVICE] Skipped duplicate send for ${maskEmail(sanitizedEmail)} (${template}) within memory deduplication window.`,
        { template, recipientHash: hashRecipient(sanitizedEmail) }
      );
      return {
        success: true,
        provider: 'mock',
        deduplicated: true,
      };
    }

    // Database-level idempotency guard
    if (!forceSend) {
      try {
        const existingEvent = await prisma.emailEvent.findUnique({
          where: { idempotencyKey: deduplicationKey },
        });

        if (existingEvent) {
          logger.info(
            `[EMAIL/SERVICE] Skipped duplicate send for ${maskEmail(sanitizedEmail)} (${template}) found in database idempotency records.`,
            { template, emailEventId: existingEvent.id, status: existingEvent.status }
          );
          return {
            success: existingEvent.status === 'SENT' || existingEvent.status === 'DELIVERED',
            provider: (existingEvent.provider as any) || 'mock',
            messageId: existingEvent.providerMessageId || undefined,
            emailEventId: existingEvent.id,
            deduplicated: true,
          };
        }
      } catch (dbCheckErr: any) {
        // Non-blocking if query fails; continue to send
        logger.warn('[EMAIL/SERVICE] Database idempotency check non-fatal note:', {
          error: dbCheckErr.message,
        });
      }
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
        errorCode: 'UNKNOWN_ERROR',
        error: `Template render error: ${renderErr.message}`,
      };
    }

    // 3. Create initial EmailEvent record in Neon PostgreSQL
    let emailEventRecord: any = null;
    try {
      emailEventRecord = await prisma.emailEvent.create({
        data: {
          securityEventId: securityEventId || null,
          userId: userId || null,
          recipientHash: hashRecipient(sanitizedEmail),
          recipientMasked: maskEmail(sanitizedEmail),
          eventType: template,
          template: template,
          subject: rendered.subject,
          status: 'SENDING',
          idempotencyKey: deduplicationKey,
          provider: emailConfig.providers.active,
          maxAttempts: emailConfig.reliability.maxRetries,
          metadata: JSON.stringify({
            template,
            eventId: eventId || undefined,
            donationId: donationId || undefined,
            receiptId: receiptId || undefined,
          }),
        },
      });
    } catch (createErr: any) {
      if (createErr.code === 'P2002') {
        // Concurrent race condition: another concurrent request created this event first
        const existing = await prisma.emailEvent.findUnique({
          where: { idempotencyKey: deduplicationKey },
        }).catch(() => null);

        if (existing) {
          logger.info(
            `[EMAIL/SERVICE] Concurrent duplicate intercepted for ${maskEmail(sanitizedEmail)} (${template}).`,
            { emailEventId: existing.id }
          );
          return {
            success: existing.status === 'SENT' || existing.status === 'DELIVERED',
            provider: (existing.provider as any) || 'mock',
            messageId: existing.providerMessageId || undefined,
            emailEventId: existing.id,
            deduplicated: true,
          };
        }
      }
      logger.warn('[EMAIL/SERVICE] Failed to initialize EmailEvent record in DB:', {
        error: createErr ? new Error(createErr.message) : undefined,
      });
    }

    // 4. Dispatch via Multi-Transport Provider with Exponential Backoff & Jitter
    const provider = getEmailProvider();
    const timeoutMs = emailConfig.reliability.sendTimeoutMs;
    const maxRetries = emailConfig.reliability.maxRetries;

    let dispatchResult: EmailSendResult = {
      success: false,
      provider: provider.getActiveProviderName(),
      error: 'Dispatch not attempted',
    };

    let attemptCount = 0;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      attemptCount = attempt;
      const attemptStart = Date.now();

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
                errorCode: 'NETWORK_TIMEOUT',
                error: `Dispatch timed out after ${timeoutMs}ms`,
                durationMs: timeoutMs,
              }),
            timeoutMs
          )
        );

        dispatchResult = await Promise.race([sendPromise, timeoutPromise]);
      } catch (dispatchErr: any) {
        dispatchResult = {
          success: false,
          provider: provider.getActiveProviderName(),
          errorCode: 'UNKNOWN_ERROR',
          error: dispatchErr.message || 'Dispatch exception',
          durationMs: Date.now() - attemptStart,
        };
      }

      // Record EmailDeliveryAttempt in PostgreSQL
      if (emailEventRecord?.id) {
        try {
          await prisma.emailDeliveryAttempt.create({
            data: {
              emailEventId: emailEventRecord.id,
              attemptNumber: attempt,
              provider: dispatchResult.provider,
              status: dispatchResult.success ? 'SUCCESS' : 'FAILED',
              httpStatus: dispatchResult.httpStatus || null,
              errorCode: dispatchResult.errorCode || null,
              errorMessage: dispatchResult.error || null,
              durationMs: dispatchResult.durationMs || Date.now() - attemptStart,
            },
          });
        } catch {
          /* non-blocking audit write */
        }
      }

      // If successful, stop retry loop
      if (dispatchResult.success) {
        break;
      }

      // If permanent error (e.g. 403 unverified domain, 401 invalid key, bad email), do not retry
      const classified = classifyEmailError(dispatchResult.error, dispatchResult.httpStatus);
      if (classified.isPermanent) {
        logger.warn(
          `[EMAIL/SERVICE] Permanent failure encountered (${classified.errorCode}). Skipping further retries.`,
          { error: dispatchResult.error ? new Error(dispatchResult.error) : undefined, recipient: maskEmail(sanitizedEmail) }
        );
        break;
      }

      // If transient error and attempts remain, wait with exponential backoff & jitter
      if (attempt < maxRetries) {
        const delayMs = calculateBackoffMs(attempt);
        logger.info(
          `[EMAIL/SERVICE] Transient error (${classified.errorCode}). Retrying in ${delayMs}ms (attempt ${attempt}/${maxRetries})...`
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    // 5. Update EmailEvent status in PostgreSQL
    const finalStatus: EmailDeliveryStatus = dispatchResult.success ? 'SENT' : 'FAILED';
    if (emailEventRecord?.id) {
      try {
        await prisma.emailEvent.update({
          where: { id: emailEventRecord.id },
          data: {
            status: finalStatus,
            providerMessageId: dispatchResult.messageId || null,
            attemptCount,
            lastErrorCode: dispatchResult.errorCode || null,
            lastErrorMessage: dispatchResult.error || null,
            sentAt: dispatchResult.success ? new Date() : null,
            failedAt: !dispatchResult.success ? new Date() : null,
          },
        });
      } catch (updateErr: any) {
        logger.warn('[EMAIL/SERVICE] Failed to update EmailEvent status:', { error: updateErr.message });
      }
    }

    // 6. Dual-write to NotificationLog for backwards compatibility with existing UI
    let logId: string | undefined;
    try {
      const sanitizedMetadata = {
        template,
        eventId: eventId || undefined,
        donationId: donationId || undefined,
        receiptId: receiptId || undefined,
        sandboxRedirected: dispatchResult.sandboxRedirected || undefined,
        provider: dispatchResult.provider,
        emailEventId: emailEventRecord?.id || undefined,
        errorCode: dispatchResult.errorCode || undefined,
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
          retryCount: attemptCount - 1,
        },
      });

      logId = logRecord.id;
    } catch (dbErr: any) {
      logger.warn('[EMAIL/SERVICE] Failed to write notification log to database:', {
        error: dbErr.message,
      });
    }

    // Update sentCache with actual provider messageId
    if (dispatchResult.success && dispatchResult.messageId) {
      const entry = sentCache.get(deduplicationKey.toLowerCase());
      if (entry) {
        entry.messageId = dispatchResult.messageId;
        entry.emailEventId = emailEventRecord?.id;
      }
    }

    logger.info(`[EMAIL/SERVICE] ${dispatchResult.success ? '✓ Sent' : '✗ Failed'}: [${template}] to ${maskEmail(sanitizedEmail)}`, {
      template,
      recipientHash: hashRecipient(sanitizedEmail),
      provider: dispatchResult.provider,
      messageId: dispatchResult.messageId,
      success: dispatchResult.success,
      errorCode: dispatchResult.errorCode,
    });

    return {
      ...dispatchResult,
      logId,
      emailEventId: emailEventRecord?.id,
    };
  }

  // ── Convenience Wrappers for Standard Flows ────────────────────────────────

  public async sendWelcomeEmail(
    email: string,
    firstName?: string,
    visitUrl?: string,
    userId?: string,
    securityEventId?: string
  ) {
    return this.send({
      template: 'WELCOME',
      to: email,
      userId,
      securityEventId,
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
    userId?: string,
    securityEventId?: string
  ) {
    return this.send({
      template: 'LOGIN_ALERT',
      to: email,
      userId,
      securityEventId,
      data: {
        email,
        fullName: name || undefined,
        ...details,
      },
    });
  }

  public async sendEmailVerification(
    email: string,
    verificationUrl: string,
    firstName?: string,
    expirationTime?: string,
    securityEventId?: string
  ) {
    return this.send({
      template: 'EMAIL_VERIFICATION',
      to: email,
      securityEventId,
      data: {
        email,
        firstName,
        verificationUrl,
        expirationTime,
      },
    });
  }

  public async sendPasswordReset(
    email: string,
    resetUrl: string,
    firstName?: string,
    expirationTime?: string,
    securityEventId?: string
  ) {
    return this.send({
      template: 'PASSWORD_RESET',
      to: email,
      securityEventId,
      data: {
        email,
        firstName,
        resetUrl,
        expirationTime,
      },
    });
  }

  public async sendSecurityAlert(
    email: string,
    action: string,
    details?: {
      dateTime?: string;
      device?: string;
      ipAddress?: string;
      approxLocation?: string;
    },
    userId?: string,
    securityEventId?: string
  ) {
    return this.send({
      template: 'SECURITY_ALERT',
      to: email,
      userId,
      securityEventId,
      data: {
        email,
        securityAction: action,
        ...details,
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
   * Retries a previously failed email event by ID.
   */
  public async retryFailedEmail(emailEventId: string): Promise<EmailSendResult> {
    const event = await prisma.emailEvent.findUnique({ where: { id: emailEventId } });
    if (!event) {
      return {
        success: false,
        provider: 'mock',
        error: 'Email event not found.',
      };
    }

    // Check if max attempts reached
    if (event.attemptCount >= event.maxAttempts) {
      return {
        success: false,
        provider: event.provider as any,
        error: `Maximum retry attempts (${event.maxAttempts}) reached for this event.`,
      };
    }

    let metadata: any = {};
    try {
      if (event.metadata) metadata = JSON.parse(event.metadata);
    } catch {
      /* ignore */
    }

    const templateType = (event.template as EmailTemplateType) || 'LOGIN_ALERT';

    // Update status to RETRYING
    await prisma.emailEvent.update({
      where: { id: emailEventId },
      data: { status: 'RETRYING' },
    }).catch(() => {});

    // Need raw recipient address; look up from notificationLog or pass in
    const notifLog = await prisma.notificationLog.findFirst({
      where: { providerMessageId: event.providerMessageId || undefined },
    });

    const recipient = notifLog?.recipient_addr || '';
    if (!recipient) {
      return {
        success: false,
        provider: event.provider as any,
        error: 'Cannot retry: original recipient address cannot be resolved from audit record.',
      };
    }

    return this.send({
      template: templateType,
      to: recipient,
      data: { email: recipient, ...(metadata.data || {}) },
      userId: event.userId || undefined,
      forceSend: true,
      securityEventId: event.securityEventId || undefined,
    });
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
