/**
 * src/config/env.ts
 * Centralized, validated environment configuration.
 */

import path from 'path';
import dotenv from 'dotenv';

// Load backend-local .env first, then root .env
dotenv.config({ path: path.join(process.cwd(), '.env'), override: true });
dotenv.config({ path: path.join(process.cwd(), '../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  PORT: parseInt(process.env.PORT || process.env.SOCKET_PORT || '3001', 10),
  PROCESS_TYPE: process.env.PROCESS_TYPE || 'all',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_OFFLINE: process.env.DB_OFFLINE === 'true',
  MONGODB_URI: process.env.MONGODB_URI || '',
  MONGODB_DATABASE_NAME: process.env.MONGODB_DATABASE_NAME || 'kcm_church',
  MONGODB_OFFLINE: process.env.MONGODB_OFFLINE === 'true',

  // Redis & BullMQ
  REDIS_URL: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  DISABLE_BULLMQ: process.env.DISABLE_BULLMQ === 'true',

  // Auth & Sessions
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'kcm-church-portal-secure-session-auth-key-2026',
  SESSION_EXPIRY_DAYS: 30,

  // Google GIS & OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',

  // Firebase Admin
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  FIREBASE_ADMIN_SERVICE_ACCOUNT: process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || '',

  // Payments
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',

  // Media
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Notifications
  HTTPSMS_API_KEY: process.env.HTTPSMS_API_KEY || '',
  HTTPSMS_FROM_NUMBER: process.env.HTTPSMS_FROM_NUMBER || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  CHURCH_NOTIFICATION_EMAIL: process.env.CHURCH_NOTIFICATION_EMAIL || 'notifications@kcmchurch.org',
};

