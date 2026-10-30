/**
 * src/webhooks/google.webhook.ts
 * Google Apps Script and Calendar webhook event receiver.
 */

import { Request, Response } from 'express';
import { logger } from '../shared/logger';

export async function handleGoogleWebhook(req: Request, res: Response): Promise<void> {
  const { event_title, event_branch, event_date } = req.body || {};
  logger.info(`[GOOGLE_WEBHOOK] Received calendar/sheet sync: ${event_title} (${event_branch})`);
  res.status(200).json({ success: true, received: { event_title, event_branch, event_date } });
}

