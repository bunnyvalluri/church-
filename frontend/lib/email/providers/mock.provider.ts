/**
 * frontend/lib/email/providers/mock.provider.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Safe Local / Offline / Testing Email Provider
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { IEmailProvider } from './email.provider.interface';
import { EmailSendOptions, EmailSendResult } from '../email.types';
import { logger } from '@/lib/logger';

export class MockProvider implements IEmailProvider {
  public readonly name = 'mock';

  public isConfigured(): boolean {
    return true; // Always available
  }

  public async send(options: EmailSendOptions): Promise<EmailSendResult> {
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    logger.info(`[EMAIL/MOCK] Simulated email dispatch to: ${recipients}`, {
      component: 'MockProvider',
      subject: options.subject,
      recipients,
      messageId,
    });

    return {
      success: true,
      messageId,
      provider: this.name,
    };
  }
}
