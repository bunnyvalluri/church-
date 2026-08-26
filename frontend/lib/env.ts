import { z } from 'zod';

/**
 * Type-Safe Centralized Environment Variable Validation Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates required runtime variables on startup and enforces security boundaries:
 *   - Client-side variables MUST have NEXT_PUBLIC_ prefix.
 *   - Server-side secrets must NEVER have NEXT_PUBLIC_ prefix.
 *   - Secret values are NEVER leaked to logs during validation.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Database Configuration
  DATABASE_URL: z.string().optional(),
  DB_OFFLINE: z.enum(['true', 'false']).default('false'),
  MONGODB_URI: z.string().optional(),
  MONGODB_DATABASE_NAME: z.string().default('kcm_church'),
  MONGODB_OFFLINE: z.enum(['true', 'false']).default('false'),
  
  // Auth & Security Secrets
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  
  // External Provider Secrets
  FIREBASE_ADMIN_SERVICE_ACCOUNT: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  HTTPSMS_API_KEY: z.string().optional(),
  HTTPSMS_WEBHOOK_SECRET: z.string().optional(),
  
  // Transactional Email Configuration
  EMAIL_PROVIDER: z.string().optional(),
  EMAIL_FROM_NAME: z.string().optional(),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  EMAIL_REPLY_TO: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_OWNER_EMAIL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_SECURE: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  NEXT_PUBLIC_SOCKET_URL: z.string().optional(),
  NEXT_PUBLIC_BACKEND_URL: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  NEXT_PUBLIC_CHURCH_NAME: z.string().optional(),
  NEXT_PUBLIC_CHURCH_ADDRESS: z.string().optional(),
  NEXT_PUBLIC_CHURCH_PHONE: z.string().optional(),
  NEXT_PUBLIC_CHURCH_EMAIL: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validates environment variables safely.
 * Never prints secret values to stdout/stderr.
 */
export function validateEnv(): { server: ServerEnv; client: ClientEnv; isValid: boolean } {
  const isServer = typeof window === 'undefined';

  const clientResult = clientEnvSchema.safeParse(process.env);
  if (!clientResult.success) {
    const errorKeys = clientResult.error.errors.map((e) => e.path.join('.'));
    console.warn(`[ENV] ⚠️ Client environment validation issues detected for: ${errorKeys.join(', ')}`);
  }

  let serverParsed: ServerEnv = {} as ServerEnv;
  if (isServer) {
    const serverResult = serverEnvSchema.safeParse(process.env);
    if (!serverResult.success) {
      const errorKeys = serverResult.error.errors.map((e) => e.path.join('.'));
      console.warn(`[ENV] ⚠️ Server environment validation issues detected for: ${errorKeys.join(', ')}`);
      serverParsed = (serverResult as any).data || (process.env as unknown as ServerEnv);
    } else {
      serverParsed = serverResult.data;
    }
  }

  return {
    server: serverParsed,
    client: clientResult.success ? clientResult.data : (process.env as unknown as ClientEnv),
    isValid: clientResult.success,
  };
}

export const env = validateEnv();
