/**
 * frontend/lib/edgeSession.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Edge-compatible session token verification for Next.js Edge Middleware.
 * Uses the standard Web Crypto API (crypto.subtle) with 0ms latency and no DB overhead.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const SESSION_COOKIE_NAME = 'kcm_session';

export interface EdgeSessionPayload {
  sessionId: string;
  role: string;
  expiresAtMs: number;
}

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'kcm-church-portal-secure-session-auth-key-2026'
  );
}

// Convert base64url string to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert Uint8Array to base64url string
function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Verifies the cryptographic HMAC-SHA256 signature of a session token at the Edge.
 * Runs in pure Web Crypto API without Node.js dependencies.
 */
export async function verifySessionAtEdge(tokenString: string | null | undefined): Promise<EdgeSessionPayload | null> {
  if (!tokenString || typeof tokenString !== 'string') return null;

  const parts = tokenString.split('.');
  if (parts.length !== 5) return null;

  const [sessionId, rawSecret, role, expiresAtMsStr, signature] = parts;
  const signaturePayload = `${sessionId}.${rawSecret}.${role}.${expiresAtMsStr}`;

  // 1. Check expiration timestamp first (fastest check)
  const expiresAtMs = parseInt(expiresAtMsStr, 10);
  if (isNaN(expiresAtMs) || Date.now() > expiresAtMs) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(getSessionSecret());

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify', 'sign']
    );

    const payloadData = encoder.encode(signaturePayload);
    const signatureData = base64UrlToUint8Array(signature);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureData as unknown as BufferSource,
      payloadData as unknown as BufferSource
    );

    if (!isValid) {
      return null;
    }

    return {
      sessionId,
      role: role.toUpperCase(),
      expiresAtMs,
    };
  } catch (err) {
    return null;
  }
}
