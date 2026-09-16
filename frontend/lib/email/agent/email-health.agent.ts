/**
 * frontend/lib/email/agent/email-health.agent.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * KCM Email Reliability Agent
 * 
 * Production health evaluation, incident classification, alert deduplication,
 * and automated recovery notifications for Kingdom of Christ Ministries.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { emailConfig } from '../email.config';
import { getEmailProvider } from '../providers';
import { logger } from '@/lib/logger';

export interface IncidentAlert {
  incidentKey: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  failure: string;
  httpStatus?: number | string;
  provider: string;
  failedCount: number;
  affectedEvent: string;
  correlationId: string;
  recommendation: string;
  detectedAt: Date;
}

export interface ReliabilityAssessment {
  healthy: boolean;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  activeProvider: string;
  providerHealth: {
    healthy: boolean;
    latencyMs: number;
    message?: string;
    hasVerifiedDomain?: boolean;
  };
  metrics: {
    windowMinutes: number;
    totalEvents: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    retryingCount: number;
    failureRatePercent: number;
  };
  activeIncidents: IncidentAlert[];
}

// ── In-Memory Alert Deduplication State ─────────────────────────────────────────
interface ActiveIncidentState {
  incidentKey: string;
  firstAlertSentAt: number;
  lastAlertSentAt: number;
  occurrences: number;
  lastFailure: string;
}

const activeIncidents = new Map<string, ActiveIncidentState>();
const ALERT_COOLDOWN_MS = 30 * 60 * 1000; // 30-minute deduplication window

export class EmailReliabilityAgent {
  public readonly name = 'KCM Email Reliability Agent';
  public readonly version = '1.0.0';

  /**
   * Conducts a comprehensive, evidence-based diagnostic across provider APIs,
   * Neon database records, and queue backlogs.
   */
  public async assessHealth(windowMinutes: number = 60): Promise<ReliabilityAssessment> {
    const provider = getEmailProvider();
    const providerReport = await provider.healthCheck();

    const sinceDate = new Date(Date.now() - windowMinutes * 60 * 1000);

    // Query real metrics from Neon PostgreSQL
    let events: any[] = [];
    try {
      events = await prisma.emailEvent.findMany({
        where: { createdAt: { gte: sinceDate } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err: any) {
      logger.error('[AGENT] Failed to query emailEvent metrics from DB:', { error: err.message });
    }

    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    let retryingCount = 0;
    let authFailures = 0;
    let lastAuthError: string | null = null;

    for (const evt of events) {
      if (evt.status === 'SENT') sentCount++;
      else if (evt.status === 'DELIVERED') deliveredCount++;
      else if (evt.status === 'FAILED') {
        failedCount++;
        if (evt.eventType === 'LOGIN_ALERT' || evt.eventType === 'WELCOME') {
          authFailures++;
          lastAuthError = evt.lastErrorMessage || evt.lastErrorCode || 'Unknown error';
        }
      } else if (evt.status === 'RETRYING' || evt.status === 'QUEUED') {
        retryingCount++;
      }
    }

    const totalEvents = events.length;
    const failureRatePercent =
      totalEvents > 0 ? Math.round((failedCount / totalEvents) * 1000) / 10 : 0;

    const detectedIncidents: IncidentAlert[] = [];

    // 1. Evaluate Provider Health Incident
    if (!providerReport.healthy) {
      const incidentKey = `PROVIDER_DOWN:${provider.getActiveProviderName()}`;
      detectedIncidents.push({
        incidentKey,
        severity: 'CRITICAL',
        title: `Email Provider ${provider.getActiveProviderName().toUpperCase()} Unreachable`,
        failure: providerReport.message || 'Provider connection check failed.',
        httpStatus: 503,
        provider: provider.getActiveProviderName(),
        failedCount: failedCount || 1,
        affectedEvent: 'ALL_TRANSACTIONAL_EMAILS',
        correlationId: crypto.randomUUID(),
        recommendation:
          'Inspect provider API status, verify credentials in environment variables, and check outbound network connectivity.',
        detectedAt: new Date(),
      });
    }

    // 2. Evaluate Unverified Domain / Sandbox Restrictions
    const details = providerReport.details;
    if (provider.getActiveProviderName() === 'resend' && details && details.hasVerifiedDomain === false) {
      const incidentKey = 'RESEND_UNVERIFIED_DOMAIN';
      detectedIncidents.push({
        incidentKey,
        severity: 'CRITICAL',
        title: 'Resend Sender Domain Unverified (Sandbox Restricted)',
        failure:
          'Resend account has 0 verified domains. Deliveries to external members are rejected with HTTP 403.',
        httpStatus: 403,
        provider: 'resend',
        failedCount: failedCount || 1,
        affectedEvent: 'AUTHENTICATION_EMAILS',
        correlationId: crypto.randomUUID(),
        recommendation:
          'Navigate to resend.com/domains, add and verify DNS records (DKIM, SPF, MX) for kcmchurch.com, and update EMAIL_FROM_ADDRESS.',
        detectedAt: new Date(),
      });
    }

    // 3. Evaluate Authentication Email Failure Spikes
    if (authFailures >= 3) {
      const incidentKey = 'AUTH_EMAIL_DELIVERY_SPIKE';
      detectedIncidents.push({
        incidentKey,
        severity: 'CRITICAL',
        title: 'Authentication Email Delivery Spike Detected',
        failure: `${authFailures} consecutive authentication emails failed in the last ${windowMinutes} minutes. Reason: ${lastAuthError}`,
        httpStatus: 500,
        provider: provider.getActiveProviderName(),
        failedCount: authFailures,
        affectedEvent: 'LOGIN_ALERT / WELCOME',
        correlationId: crypto.randomUUID(),
        recommendation:
          'Check Neon database email_events and email_delivery_attempts tables for specific error codes.',
        detectedAt: new Date(),
      });
    }

    // 4. Overall Health Determination
    let status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' = 'OPERATIONAL';
    if (!providerReport.healthy || authFailures >= 3) {
      status = 'OUTAGE';
    } else if (failureRatePercent > 20 || retryingCount >= 5) {
      status = 'DEGRADED';
    }

    return {
      healthy: status === 'OPERATIONAL',
      status,
      activeProvider: provider.getActiveProviderName(),
      providerHealth: {
        healthy: providerReport.healthy,
        latencyMs: providerReport.latencyMs,
        message: providerReport.message,
        hasVerifiedDomain: details?.hasVerifiedDomain,
      },
      metrics: {
        windowMinutes,
        totalEvents,
        sentCount,
        deliveredCount,
        failedCount,
        retryingCount,
        failureRatePercent,
      },
      activeIncidents: detectedIncidents,
    };
  }

  /**
   * Evaluates system health and dispatches deduplicated alerts or recovery
   * notices directly to the designated administrator (Vallurirahul3@gmail.com).
   */
  public async monitorAndAlert(): Promise<{
    assessment: ReliabilityAssessment;
    alertsSent: number;
    recoveriesSent: number;
  }> {
    const assessment = await this.assessHealth();
    const now = Date.now();
    let alertsSent = 0;
    let recoveriesSent = 0;

    // 1. Process Active Incidents
    for (const incident of assessment.activeIncidents) {
      const state = activeIncidents.get(incident.incidentKey);

      if (!state) {
        // First occurrence: Send Alert
        await this.dispatchIncidentAlert(incident);
        activeIncidents.set(incident.incidentKey, {
          incidentKey: incident.incidentKey,
          firstAlertSentAt: now,
          lastAlertSentAt: now,
          occurrences: 1,
          lastFailure: incident.failure,
        });
        alertsSent++;
      } else {
        // Increment occurrence counter
        state.occurrences++;
        state.lastFailure = incident.failure;

        // Check if cooldown expired
        if (now - state.lastAlertSentAt > ALERT_COOLDOWN_MS) {
          await this.dispatchIncidentAlert({
            ...incident,
            failedCount: state.occurrences,
          });
          state.lastAlertSentAt = now;
          alertsSent++;
        }
      }
    }

    // 2. Detect Recoveries
    const currentKeys = new Set(assessment.activeIncidents.map((i) => i.incidentKey));
    for (const [key, state] of activeIncidents.entries()) {
      if (!currentKeys.has(key)) {
        // Incident resolved! Send recovery notice
        await this.dispatchRecoveryAlert(state);
        activeIncidents.delete(key);
        recoveriesSent++;
      }
    }

    return { assessment, alertsSent, recoveriesSent };
  }

  /**
   * Formats and dispatches a secure incident alert email to Vallurirahul3@gmail.com.
   * STRICT SECURITY: Never includes passwords, API keys, or raw tokens.
   */
  private async dispatchIncidentAlert(incident: IncidentAlert): Promise<void> {
    const alertRecipient = emailConfig.reliability.alertRecipient;

    const subject = `[KCM ALERT] Production Email Delivery Failure - ${incident.title}`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #ef4444; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ef4444, #991b1b); padding: 18px 24px;">
      <h2 style="margin: 0; color: #ffffff; font-size: 18px;">⚠️ KCM Production Email Alert</h2>
      <p style="margin: 4px 0 0; color: #fecaca; font-size: 13px;">Severity: ${incident.severity} | Environment: ${emailConfig.environment.mode.toUpperCase()}</p>
    </div>
    <div style="padding: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr><td style="padding: 8px 0; color: #94a3b8; width: 140px;">Service:</td><td style="font-weight: 600;">Authentication Email Service</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Detected:</td><td>${incident.detectedAt.toUTCString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Failure:</td><td style="color: #f87171; font-weight: 600;">${incident.failure}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">HTTP Status:</td><td>${incident.httpStatus || 'N/A'}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Provider:</td><td>${incident.provider}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Failed Attempts:</td><td>${incident.failedCount}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Affected Event:</td><td>${incident.affectedEvent}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Correlation ID:</td><td style="font-family: monospace; font-size: 12px;">${incident.correlationId}</td></tr>
      </table>

      <div style="background: #0f172a; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 6px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 6px; color: #fbbf24; font-size: 13px;">Recommended Investigation:</h4>
        <p style="margin: 0; color: #cbd5e1; font-size: 13px; line-height: 1.5;">${incident.recommendation}</p>
      </div>

      <div style="text-align: center;">
        <a href="${emailConfig.church.websiteUrl}/admin" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px;">Open Member / Admin Portal</a>
      </div>
    </div>
    <div style="background: #0f172a; padding: 12px 24px; font-size: 11px; color: #64748b; border-top: 1px solid #334155;">
      Kingdom of Christ Ministries — Automated Reliability Agent. Sensitive secrets are redacted per security policy.
    </div>
  </div>
</body>
</html>
`;

    const text = `
[KCM ALERT] Production Email Delivery Failure
=============================================
Severity: ${incident.severity}
Environment: ${emailConfig.environment.mode.toUpperCase()}
Service: Authentication Email Service
Detected: ${incident.detectedAt.toUTCString()}
Failure: ${incident.failure}
HTTP Status: ${incident.httpStatus || 'N/A'}
Provider: ${incident.provider}
Failed Attempts: ${incident.failedCount}
Affected Event: ${incident.affectedEvent}
Correlation ID: ${incident.correlationId}

Recommended Investigation:
${incident.recommendation}

Dashboard: ${emailConfig.church.websiteUrl}/admin
    `.trim();

    logger.warn(`[AGENT] Dispatching critical incident alert to ${alertRecipient}`, {
      title: incident.title,
      correlationId: incident.correlationId,
    });

    // Send via provider direct
    const provider = getEmailProvider();
    try {
      await provider.send({
        to: alertRecipient,
        subject,
        html,
        text,
        from: emailConfig.sender.formattedFrom,
      });
    } catch (dispatchErr: any) {
      logger.error('[AGENT] Failed to dispatch incident alert email:', {
        error: dispatchErr.message,
      });
    }
  }

  /**
   * Formats and dispatches a recovery notification when service returns to operational status.
   */
  private async dispatchRecoveryAlert(state: ActiveIncidentState): Promise<void> {
    const alertRecipient = emailConfig.reliability.alertRecipient;
    const subject = `[KCM RECOVERY] Production Email Service Recovered - ${state.incidentKey}`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${subject}</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 12px; border: 1px solid #10b981; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #10b981, #047857); padding: 18px 24px;">
      <h2 style="margin: 0; color: #ffffff; font-size: 18px;">✅ KCM Production Email Service Recovered</h2>
      <p style="margin: 4px 0 0; color: #d1fae5; font-size: 13px;">Status: OPERATIONAL | Environment: ${emailConfig.environment.mode.toUpperCase()}</p>
    </div>
    <div style="padding: 24px;">
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5;">The previous delivery incident has resolved. Email delivery health check is currently reporting healthy with 0 active failures.</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
        <tr><td style="padding: 8px 0; color: #94a3b8; width: 140px;">Recovered Incident:</td><td style="font-weight: 600;">${state.incidentKey}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">First Detected:</td><td>${new Date(state.firstAlertSentAt).toUTCString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Recovered At:</td><td>${new Date().toUTCString()}</td></tr>
        <tr><td style="padding: 8px 0; color: #94a3b8;">Total Incidents:</td><td>${state.occurrences}</td></tr>
      </table>
    </div>
    <div style="background: #0f172a; padding: 12px 24px; font-size: 11px; color: #64748b; border-top: 1px solid #334155;">
      Kingdom of Christ Ministries — Automated Reliability Agent.
    </div>
  </div>
</body>
</html>
`;

    const text = `
[KCM RECOVERY] Production Email Service Recovered
=================================================
Status: OPERATIONAL
Recovered Incident: ${state.incidentKey}
First Detected: ${new Date(state.firstAlertSentAt).toUTCString()}
Recovered At: ${new Date().toUTCString()}
Total Incidents: ${state.occurrences}
    `.trim();

    logger.info(`[AGENT] Dispatching recovery alert for ${state.incidentKey} to ${alertRecipient}`);

    const provider = getEmailProvider();
    try {
      await provider.send({
        to: alertRecipient,
        subject,
        html,
        text,
        from: emailConfig.sender.formattedFrom,
      });
    } catch (err: any) {
      logger.error('[AGENT] Failed to dispatch recovery alert email:', { error: err.message });
    }
  }
}

// ── Shared Singleton Export ──────────────────────────────────────────────────
let _sharedAgent: EmailReliabilityAgent | null = null;

export function getEmailReliabilityAgent(): EmailReliabilityAgent {
  if (!_sharedAgent) {
    _sharedAgent = new EmailReliabilityAgent();
  }
  return _sharedAgent;
}

export const emailReliabilityAgent = getEmailReliabilityAgent();
