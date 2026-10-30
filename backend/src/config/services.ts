/**
 * src/config/services.ts
 * Integrations and third-party provider configurations.
 */

import { env } from './env';

export const servicesConfig = {
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
    currency: 'INR',
  },
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  },
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    serviceAccount: env.FIREBASE_ADMIN_SERVICE_ACCOUNT,
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
  },
  notifications: {
    httpsmsApiKey: env.HTTPSMS_API_KEY,
    httpsmsFromNumber: env.HTTPSMS_FROM_NUMBER,
    resendApiKey: env.RESEND_API_KEY,
    fromEmail: env.CHURCH_NOTIFICATION_EMAIL,
  },
};

