/**
 * frontend/tests/email-system.spec.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Automated Quality & Security Test Suite for KCM Email Infrastructure
 * 
 * Verifies:
 *  1. Production emails contain NO dev sandbox notice
 *  2. Production subjects contain NO [Sandbox Preview...] prefix
 *  3. HTML output is valid and contains NO raw CSS fragments
 *  4. XSS & HTML injection vectors in user-controlled fields are properly escaped
 *  5. Plain-text fallbacks exist for multipart/alternative MIME delivery
 *  6. LOGIN_ALERT security template adheres to church branding specifications
 *  7. Missing optional fields do not render as "undefined"
 *  8. Idempotency guard prevents duplicate transactional emails
 *  9. Invalid email inputs are safely rejected
 * 10. Secrets and credentials never leak into email bodies
 * 11. All 20 templates render cleanly and without runtime exceptions
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test';
import { renderEmailTemplate } from '../lib/email/email.templates';
import { renderMasterEmailHtml, htmlToPlainText, escapeHtml } from '../lib/email/email.renderer';
import { EmailService } from '../lib/email/email.service';
import { emailConfig } from '../lib/email/email.config';
import { EmailTemplateType } from '../lib/email/email.types';

test.describe('KCM Transactional Email Architecture & Security Tests', () => {

  test('1. Production email template must NOT contain DEV SANDBOX NOTICE', () => {
    const rendered = renderEmailTemplate('LOGIN_ALERT', {
      email: 'member@example.com',
      firstName: 'Vinay',
      loginDateTime: 'Thu, 27 Aug, 2026, 02:45 pm IST',
      loginMethod: 'Google Sign-In',
      device: 'Desktop Browser',
      browser: 'Chrome 120.0',
      ipAddress: '203.0.113.195',
    });

    expect(rendered.html).not.toContain('DEV SANDBOX NOTICE');
    expect(rendered.html).not.toContain('⚠️ DEV SANDBOX NOTICE');
    expect(rendered.html).not.toContain('delivered to verified owner mailbox');
  });

  test('2. Production email subject must NOT contain [Sandbox Preview] prefix', () => {
    const rendered = renderEmailTemplate('LOGIN_ALERT', {
      email: 'member@example.com',
      firstName: 'Vinay',
    });

    expect(rendered.subject).not.toContain('[Sandbox Preview');
    expect(rendered.subject).not.toContain('[Dev Preview');
    expect(rendered.subject).toBe('New Sign-In to Your Kingdom of Christ Ministries Account');
  });

  test('3. Rendered HTML must NOT contain raw CSS text fragments leaked as body text', () => {
    const rendered = renderEmailTemplate('LOGIN_ALERT', {
      email: 'vinaytech843@gmail.com',
      firstName: 'Vinay',
      loginDateTime: 'Thu, 27 Aug, 2026, 02:45 pm IST',
      loginMethod: 'Google Sign-In',
      device: 'Desktop Browser',
      browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      ipAddress: '::1',
    });

    // Check for the specific regression where style attributes leaked outside tag as orphaned text
    expect(rendered.html).not.toContain('</div> background-color:');
    expect(rendered.html).not.toContain('</div> background:');
    expect(rendered.html).not.toContain('background: #f8f8fc; color: #1c293b;" >');
    expect(rendered.html).not.toMatch(/<\/div>\s*background-color:/i);
    expect(rendered.html).not.toMatch(/<\/div>\s*color:/i);
    expect(rendered.html).not.toMatch(/<\/body>\s*background/i);
  });

  test('4. User input containing XSS and HTML injection vectors must be safely escaped', () => {
    const maliciousPayload = '<script>alert("xss")</script><img src=x onerror=alert(1)>"Hello" & \'World\'';
    const rendered = renderEmailTemplate('LOGIN_ALERT', {
      email: 'attacker@example.com',
      firstName: maliciousPayload,
      loginMethod: '<script>evil()</script>',
      device: '<b onmouseover=evil()>Phone</b>',
      browser: '"><script>alert(1)</script>',
      ipAddress: '192.168.1.1<script>',
    });

    // Ensure no unescaped tags exist in HTML
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.html).not.toContain('<img src=x');
    expect(rendered.html).not.toContain('<b onmouseover');
    
    // Ensure all characters were properly converted to HTML entities
    expect(rendered.html).toContain('&lt;script&gt;');
    expect(rendered.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(rendered.html).toContain('&quot;Hello&quot;');
    expect(rendered.html).toContain('&#39;World&#39;');
    expect(rendered.html).toContain('&lt;b onmouseover=evil()&gt;');
  });

  test('5. Plain-text version must exist and contain no raw HTML tags', () => {
    const rendered = renderEmailTemplate('WELCOME', {
      email: 'welcome@example.com',
      firstName: 'Grace',
    });

    expect(rendered.text).toBeTruthy();
    expect(rendered.text).not.toContain('<table');
    expect(rendered.text).not.toContain('<html');
    expect(rendered.text).not.toContain('<body');
    expect(rendered.text).toContain('Welcome to Kingdom of Christ Ministries');
    expect(rendered.text).toContain('Hello Grace,');
  });

  test('6. LOGIN_ALERT template must contain all required church security details and links', () => {
    const rendered = renderEmailTemplate('LOGIN_ALERT', {
      email: 'vinaytech843@gmail.com',
      firstName: 'Vinay',
      loginDateTime: 'Thu, 27 Aug, 2026, 02:45 pm IST',
      loginMethod: 'Google Sign-In',
      device: 'Desktop Browser',
      browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      ipAddress: '::1',
    });

    // Header Branding
    expect(rendered.html).toContain('Kingdom of Christ Ministries');
    // Badge
    expect(rendered.html).toContain('Security Notice');
    // Greeting
    expect(rendered.html).toContain('Hello Vinay,');
    // Lead text
    expect(rendered.html).toContain('We detected a successful sign-in to your Kingdom of Christ Ministries account.');
    // Sign-in Details Table
    expect(rendered.html).toContain('Sign-In Details');
    expect(rendered.html).toContain('vinaytech843@gmail.com');
    expect(rendered.html).toContain('Google Sign-In');
    expect(rendered.html).toContain('Thu, 27 Aug, 2026, 02:45 pm IST');
    expect(rendered.html).toContain('Desktop Browser');
    expect(rendered.html).toContain('::1');
    // Security Callout
    expect(rendered.html).toContain('If this was you, no action is required.');
    expect(rendered.html).toContain('If you do not recognize this activity, secure your account immediately');
    // CTA Button
    expect(rendered.html).toContain('Open Member Portal');
    // Footer Legal Links
    expect(rendered.html).toContain('Website');
    expect(rendered.html).toContain('Privacy Policy');
    expect(rendered.html).toContain('Terms of Service');
  });

  test('7. Missing optional fields must not render as "undefined" or null', () => {
    const rendered = renderEmailTemplate('EVENT_CREATED', {
      email: 'member@example.com',
      eventName: 'Sunday Miracle Service',
      eventDate: 'Sunday, 30 August 2026',
      eventLocation: 'Main Sanctuary, Jeedimetla',
      eventUrl: 'https://kcmchurch.vercel.app/events/1',
      // eventTime, branchName, eventDescription are intentionally omitted
    });

    expect(rendered.html).not.toContain('undefined');
    expect(rendered.html).not.toContain('null');
    expect(rendered.html).toContain('Sunday Miracle Service');
  });

  test('8. Idempotency guard must prevent duplicate emails within deduplication window', async () => {
    const emailService = new EmailService();
    const testEmail = 'idempotency-test@example.com';

    // First send
    const res1 = await emailService.send({
      template: 'LOGIN_ALERT',
      to: testEmail,
      data: {
        email: testEmail,
        firstName: 'TestUser',
      },
    });

    expect(res1).toBeDefined();

    // Immediate duplicate send
    const res2 = await emailService.send({
      template: 'LOGIN_ALERT',
      to: testEmail,
      data: {
        email: testEmail,
        firstName: 'TestUser',
      },
    });

    expect(res2.deduplicated).toBe(true);
  });

  test('9. Invalid recipient email addresses must be rejected safely', async () => {
    const emailService = new EmailService();
    const res = await emailService.send({
      template: 'WELCOME',
      to: 'invalid-email-no-at-sign',
      data: {
        email: 'invalid-email-no-at-sign',
      },
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid recipient');
  });

  test('10. Secrets, API keys, and database passwords must NEVER appear in email output', () => {
    const sampleTemplates: EmailTemplateType[] = [
      'WELCOME',
      'EMAIL_VERIFICATION',
      'PASSWORD_RESET',
      'LOGIN_ALERT',
      'DONATION_RECEIPT',
      'SECURITY_ALERT',
    ];

    for (const t of sampleTemplates) {
      const rendered = renderEmailTemplate(t, {
        email: 'test@example.com',
        verificationUrl: 'https://kcmchurch.vercel.app/verify?token=fake_token_123',
        resetUrl: 'https://kcmchurch.vercel.app/reset?token=fake_reset_123',
        receiptNumber: 'REC-2026-001',
        donationAmount: '₹5,000.00',
        transactionId: 'TXN_9999',
        date: '29 Aug 2026',
        purpose: 'General Tithe',
        verificationCode: 'VER-8888',
        receiptUrl: 'https://kcmchurch.vercel.app/receipt/1',
        securityAction: 'Password Changed',
      } as any);

      expect(rendered.html).not.toContain(process.env.RESEND_API_KEY || 're_not_existent');
      expect(rendered.html).not.toContain(process.env.DATABASE_URL || 'postgresql://');
      expect(rendered.html).not.toContain(process.env.SMTP_PASS || 'fake_pass');
    }
  });

  test('11. All 20 email templates (A through T) must render valid HTML without exceptions', () => {
    const allTemplateTypes: EmailTemplateType[] = [
      'WELCOME',
      'EMAIL_VERIFICATION',
      'PASSWORD_RESET',
      'LOGIN_ALERT',
      'EVENT_CREATED',
      'EVENT_UPDATED',
      'EVENT_REMINDER',
      'EVENT_CANCELLED',
      'PRAYER_CONFIRMATION',
      'PRAYER_STATUS_UPDATE',
      'DONATION_CONFIRMATION',
      'DONATION_RECEIPT',
      'VOLUNTEER_CONFIRMATION',
      'VOLUNTEER_APPROVAL',
      'MEMBERSHIP_CONFIRMATION',
      'MEMBERSHIP_APPROVAL',
      'NEW_SERMON',
      'CHURCH_ANNOUNCEMENT',
      'MINISTRY_NOTIFICATION',
      'SECURITY_ALERT',
    ];

    for (const templateType of allTemplateTypes) {
      const dummyData: any = {
        email: 'member@example.com',
        firstName: 'Beloved',
        verificationUrl: 'https://kcmchurch.vercel.app/verify',
        resetUrl: 'https://kcmchurch.vercel.app/reset',
        eventName: 'Worship Night',
        eventDate: '30 Aug 2026',
        eventLocation: 'Main Hall',
        eventUrl: 'https://kcmchurch.vercel.app/events/1',
        updateSummary: 'Time moved to 6:00 PM',
        cancellationReason: 'Weather condition',
        prayerRequestId: 'PR-1001',
        status: 'Answered',
        donationAmount: '₹1,000.00',
        transactionId: 'TXN-12345',
        date: '29 Aug 2026',
        receiptNumber: 'RCP-001',
        purpose: 'Building Fund',
        verificationCode: 'VRF-999',
        receiptUrl: 'https://kcmchurch.vercel.app/receipts/1',
        ministry: 'Youth Ministry',
        sermonTitle: 'Walking by Faith',
        announcementTitle: 'Special Fasting Week',
        announcementBody: '<p>Join us in 3 days of fasting and prayer.</p>',
        ministryName: 'Choir & Worship',
        notificationTitle: 'Practice Session Rehearsal',
        notificationBody: '<p>Rehearsal scheduled for Saturday at 5 PM.</p>',
        securityAction: '2FA Enabled',
      };

      const rendered = renderEmailTemplate(templateType, dummyData);
      expect(rendered.subject).toBeTruthy();
      expect(rendered.previewText).toBeTruthy();
      expect(rendered.html).toBeTruthy();
      expect(rendered.html).toContain('<!DOCTYPE html');
      expect(rendered.html).toContain('</html>');
      expect(rendered.text).toBeTruthy();
    }
  });

});
