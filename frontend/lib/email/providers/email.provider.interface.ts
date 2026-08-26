/**
 * frontend/lib/email/providers/email.provider.interface.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Base interface for email delivery providers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { EmailSendOptions, EmailSendResult, EmailProviderName } from '../email.types';

export interface IEmailProvider {
  readonly name: EmailProviderName;
  isConfigured(): boolean;
  send(options: EmailSendOptions): Promise<EmailSendResult>;
}
