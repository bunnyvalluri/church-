import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getClientIp } from '@/lib/apiResponse';
import { rateLimitHeaders, isRateLimited } from '@/lib/rateLimit';

// ── Validation Schema ────────────────────────────────────────────────────────
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
});

// ── Rate limit: 3 password reset requests per 15 minutes per IP ──────────────
const RL_OPTS = { windowMs: 15 * 60 * 1000, maxRequests: 3 };

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, RL_OPTS);

  // 1. Rate limiting
  if (isRateLimited(ip, RL_OPTS)) {
    return NextResponse.json(
      { error: "Too many password reset requests. Please wait 15 minutes before trying again." },
      { status: 429, headers: rlHeaders }
    );
  }

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400, headers: rlHeaders }
      );
    }

    const { email } = parsed.data;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
      console.error('[AUTH/FORGOT-PASSWORD] Missing Firebase API Key in backend env');
      return NextResponse.json(
        { error: "Auth service configuration error. Please contact support." },
        { status: 500, headers: rlHeaders }
      );
    }

    // 2. Call Firebase Auth REST API to send password reset email
    const firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'PASSWORD_RESET',
          email,
        }),
      }
    );

    const result = await firebaseResponse.json();

    if (!firebaseResponse.ok) {
      console.warn('[AUTH/FORGOT-PASSWORD] Firebase REST API failed:', result.error?.message || result);
      // Return success anyway to prevent email enumeration attacks (security best practice)
      return NextResponse.json({ success: true }, { status: 200, headers: rlHeaders });
    }

    console.log(`[AUTH/FORGOT-PASSWORD] ✅ Password reset email sent for: ${email}`);
    return NextResponse.json({ success: true }, { status: 200, headers: rlHeaders });

  } catch (err: any) {
    console.error('[AUTH/FORGOT-PASSWORD] Error:', err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: rlHeaders }
    );
  }
}
