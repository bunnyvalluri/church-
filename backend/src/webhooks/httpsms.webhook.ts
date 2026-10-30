/**
 * src/webhooks/httpsms.webhook.ts
 * Inbound SMS and Delivery Receipt Webhook Handler.
 */

import { Request, Response } from 'express';
import { logger } from '../shared/logger';

export async function handleHttpSmsWebhook(req: Request, res: Response): Promise<void> {
  const { id, status, recipient, timestamp } = req.body || {};
  logger.info(`[HTTPSMS_WEBHOOK] Received SMS delivery update for ${id}: status=${status}`);
  res.status(200).json({ success: true, received: { id, status } });
}

