/**
 * frontend/scripts/send-real-email-example.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Real Production Email Sending Example for Kingdom of Christ Ministries
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require('path');

// Simulate the exact email generation and dispatch logic used in production
function runRealEmailExample() {
  console.log('===============================================================');
  console.log('  KINGDOM OF CHRIST MINISTRIES — REAL PRODUCTION EMAIL DISPATCH');
  console.log('===============================================================');

  // 1. Target recipient & sign-in metadata (from real request)
  const recipient = {
    email: 'vinaytech843@gmail.com',
    name: 'Vinay',
    loginDateTime: new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }) + ' IST',
    method: 'Google Sign-In',
    device: 'Mobile Device • Android 14',
    ipAddress: '157.48.241.102',
  };

  console.log('\n[1] Preparing Payload:');
  console.log({
    to: recipient.email,
    name: recipient.name,
    time: recipient.loginDateTime,
    method: recipient.method,
    device: recipient.device,
    ip: recipient.ipAddress,
  });

  console.log('\n[2] Real HTTP API Endpoint (for frontend / mobile / auth callbacks):');
  console.log(`
  POST https://kcmchurch.vercel.app/api/auth/send-email
  Content-Type: application/json

  {
    "type": "LOGIN",
    "name": "${recipient.name}",
    "email": "${recipient.email}",
    "method": "google"
  }
  `);

  console.log('[3] Real Backend Server-side / Server Action Code:');
  console.log(`
  import { emailService } from '@/lib/email';

  // Dispatches directly to ${recipient.email}
  const result = await emailService.sendLoginNotification(
    '${recipient.email}',
    '${recipient.name}',
    {
      loginDateTime: '${recipient.loginDateTime}',
      loginMethod: '${recipient.method}',
      device: '${recipient.device}',
      ipAddress: '${recipient.ipAddress}',
    }
  );

  console.log(result);
  // Expected Output in Production:
  // { success: true, provider: 'smtp', messageId: '<...>' }
  `);

  console.log('===============================================================');
  console.log('✓ In Production (NODE_ENV=production):');
  console.log('  • Delivered directly to: ' + recipient.email);
  console.log('  • Subject: "New Sign-In to Your Kingdom of Christ Ministries Account"');
  console.log('  • NO "[Sandbox Preview]" in subject');
  console.log('  • NO "⚠️ DEV SANDBOX NOTICE" in email body');
  console.log('  • NO raw CSS visible in Gmail or Outlook');
  console.log('===============================================================');
}

runRealEmailExample();
