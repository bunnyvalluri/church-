/**
 * frontend/lib/email/email.config.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Email Configuration for Kingdom of Christ Ministries
 * ─────────────────────────────────────────────────────────────────────────────
 */

const resolvedMode = (
  process.env.EMAIL_MODE ||
  (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production' || process.env.APP_ENV === 'production'
    ? 'production'
    : 'development')
).toLowerCase().trim() as 'production' | 'staging' | 'development';

export const emailConfig = {
  environment: {
    mode: resolvedMode,
    nodeEnv: process.env.NODE_ENV || 'development',
    appEnv: process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    get isProduction(): boolean {
      return this.mode === 'production';
    },
    get isStaging(): boolean {
      return this.mode === 'staging';
    },
    get isDevelopment(): boolean {
      return this.mode === 'development';
    },
  },

  church: {
    name: process.env.NEXT_PUBLIC_CHURCH_NAME || 'Kingdom of Christ Ministries',
    tagline: 'Faith • Love • Service • Community',
    address:
      process.env.NEXT_PUBLIC_CHURCH_ADDRESS ||
      '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055',
    phone: process.env.NEXT_PUBLIC_CHURCH_PHONE || '+91 96409 43777 | +91 97040 90069',
    websiteUrl:
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      process.env.NEXTAUTH_URL ||
      'https://kcmchurch.vercel.app',
    portalUrl: `${
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      'https://kcmchurch.vercel.app'
    }/member`,
    privacyUrl: `${
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      'https://kcmchurch.vercel.app'
    }/privacy`,
    termsUrl: `${
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.FRONTEND_URL ||
      'https://kcmchurch.vercel.app'
    }/terms`,
    supportEmail: process.env.EMAIL_REPLY_TO || 'kingofchristministries23@gmail.com',
  },

  sender: {
    name: process.env.EMAIL_FROM_NAME || 'Kingdom of Christ Ministries',
    address:
      process.env.EMAIL_FROM_ADDRESS ||
      process.env.EMAIL_FROM ||
      process.env.RESEND_FROM_EMAIL ||
      (resolvedMode === 'production' ? 'notifications@kcmchurch.com' : 'onboarding@resend.dev'),
    replyTo: process.env.EMAIL_REPLY_TO || 'kingofchristministries23@gmail.com',
    get formattedFrom(): string {
      const name = process.env.EMAIL_FROM_NAME || 'Kingdom of Christ Ministries';
      const rawAddr =
        process.env.EMAIL_FROM_ADDRESS ||
        process.env.EMAIL_FROM ||
        process.env.RESEND_FROM_EMAIL ||
        (resolvedMode === 'production' ? 'notifications@kcmchurch.com' : 'onboarding@resend.dev');
      if (rawAddr.includes('<') && rawAddr.includes('>')) {
        return rawAddr;
      }
      return `"${name}" <${rawAddr}>`;
    },
  },

  providers: {
    active: (process.env.EMAIL_PROVIDER || 'resend').toLowerCase() as
      | 'resend'
      | 'smtp'
      | 'mock',
    resend: {
      apiKey: process.env.RESEND_API_KEY || '',
      webhookSecret: process.env.RESEND_WEBHOOK_SECRET || '',
      fallbackOwner: process.env.RESEND_OWNER_EMAIL || 'rahulgamer.7123@gmail.com',
    },
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure:
        process.env.SMTP_SECURE === 'true' ||
        Number(process.env.SMTP_PORT) === 465 ||
        !process.env.SMTP_PORT,
      user:
        process.env.SMTP_USER ||
        process.env.GMAIL_USER ||
        'kingofchristministries23@gmail.com',
      pass:
        process.env.SMTP_PASS ||
        process.env.SMTP_PASSWORD ||
        process.env.GMAIL_APP_PASSWORD ||
        '',
    },
  },

  reliability: {
    deduplicationTtlMs: 3 * 60 * 1000, // 3 minutes sliding window
    sendTimeoutMs: 4000,               // 4 seconds bounded dispatch timeout for serverless functions
    maxRetries: 3,
    alertRecipient: process.env.EMAIL_ALERT_RECIPIENT || 'Vallurirahul3@gmail.com',
  },
};
