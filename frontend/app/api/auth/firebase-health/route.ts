export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

/**
 * GET /api/auth/firebase-health
 *
 * Returns a safe diagnostic payload confirming whether the Firebase
 * environment variables are configured on this deployment.
 *
 * SECURITY: Never returns full key values — only the last 4 characters
 * of each credential for verification purposes.
 */
export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '';
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '';

  const mask = (val: string) =>
    val.length > 4 ? `***${val.slice(-4)}` : val ? '****' : 'NOT_SET';

  const allConfigured = !!(apiKey && authDomain && projectId && appId);

  return NextResponse.json({
    firebase_health: allConfigured ? 'ok' : 'missing_config',
    project_id: projectId || 'NOT_SET',
    auth_domain: authDomain || 'NOT_SET',
    api_key_suffix: mask(apiKey),
    app_id_suffix: mask(appId),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
