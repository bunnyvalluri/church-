/**
 * Safely triggers an event on the Socket.io companion server via HTTP.
 * Sets a short timeout and skips localhost URLs in production to prevent blocking API responses.
 *
 * @param type The event type (e.g. 'donation.success')
 * @param payload The event payload
 * @param room Optional room to target
 */
export async function safeTriggerCompanionEvent(type: string, payload: any, room?: string): Promise<boolean> {
  const companionUrl = process.env.SOCKET_INTERNAL_URL || process.env.NEXT_PUBLIC_SOCKET_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001');

  if (!companionUrl) {
    return false;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isLocalhost = companionUrl.includes('localhost') || companionUrl.includes('127.0.0.1');

  if (isProduction && isLocalhost) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout

  try {
    const res = await fetch(`${companionUrl}/api/trigger-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload, room }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[SOCKET_TRIGGER] Failed to trigger event '${type}' on companion:`, err.message || err);
    return false;
  }
}
