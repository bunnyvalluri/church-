/**
 * backend/src/loops/config.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Configuration module for Loop Engineering Architecture.
 * Holds invariants, queue settings, branch definitions, and retry parameters.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  // Environment & Core State
  env: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  revalidateSecret: process.env.REVALIDATE_SECRET || 'kcm_secret_revalidate_key',

  // Monitored Church Branches
  branches: [
    {
      id: 'branch_shapur_01',
      name: 'Shapur Nagar',
      code: 'SHAPUR',
      pastorEmail: 'shapur.lead@kcmministries.org',
    },
    {
      id: 'branch_subhash_02',
      name: 'Subhash Nagar',
      code: 'SUBHASH',
      pastorEmail: 'subhash.lead@kcmministries.org',
    },
    {
      id: 'branch_bahadur_03',
      name: 'Bahadurpally',
      code: 'BAHADUR',
      pastorEmail: 'bahadur.lead@kcmministries.org',
    },
  ],

  // Queue & Worker Parameters (Exponential Backoff with Jitter)
  queues: {
    eventUpload: {
      name: 'eventUploadQueue',
      concurrency: 3,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
    securityAudit: {
      name: 'securityAuditQueue',
      concurrency: 10,
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
    },
    branchAudit: {
      name: 'branchAuditQueue',
      concurrency: 2,
      attempts: 3,
      backoff: { type: 'exponential', delay: 10000 },
    },
    notification: {
      name: 'notificationQueue',
      concurrency: 15,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    },
    offlineSync: {
      name: 'offlineSyncQueue',
      concurrency: 5,
      attempts: 4,
      backoff: { type: 'exponential', delay: 3000 },
    },
    donation: {
      name: 'donationQueue',
      concurrency: 5,
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
    },
  },

  // Security Loop Invariants
  security: {
    maxFailedLoginsPerWindow: 5,
    loginWindowMinutes: 5,
    allowedUploadMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'video/mp4',
    ],
    maxFileUploadSizeBytes: 25 * 1024 * 1024, // 25 MB
  },

  // Cron Schedules (Standard 5-part cron syntax)
  crons: {
    securityScan: '*/5 * * * *',       // Every 5 minutes
    branchAudit: '0 */6 * * *',        // Every 6 hours
    notificationRetry: '*/15 * * * *', // Every 15 minutes
    offlineSyncCheck: '*/10 * * * *',  // Every 10 minutes
  },

  // Third Party Integrations
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'kcm_razorpay_webhook_secret',
  },
};
