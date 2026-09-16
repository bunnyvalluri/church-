/**
 * frontend/lib/email/providers/email.provider.interface.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Base interface for email delivery providers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { EmailSendOptions, EmailSendResult, EmailProviderName } from '../email.types';

export interface ProviderHealthReport {
  healthy: boolean;
  latencyMs: number;
  provider: EmailProviderName;
  message?: string;
  details?: Record<string, any>;
}

export interface IEmailProvider {
  readonly name: EmailProviderName;
  isConfigured(): boolean;
  send(options: EmailSendOptions): Promise<EmailSendResult>;
  verifyConfiguration(): Promise<{ valid: boolean; reason?: string }>;
  healthCheck(): Promise<ProviderHealthReport>;
  getDeliveryStatus?(providerMessageId: string): Promise<string | null>;
}
