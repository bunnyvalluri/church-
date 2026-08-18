export const dynamic = 'force-dynamic';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp, safeJson } from '@/lib/apiResponse';
import { z } from 'zod';

// ── Validation ────────────────────────────────────────────────────────────────
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(6000).trim(),
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
});

// ── Rate limit config ─────────────────────────────────────────────────────────
const RL_OPTS = { windowMs: 60_000, maxRequests: 20 };

// ── KCM System Prompt ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "KCM Assistant" — the official AI assistant for Kingdom of Christ Ministries (KCM), Hyderabad.

━━ RESPONSE RULES — FOLLOW STRICTLY ━━
1. ALWAYS answer in 1-3 sentences MAX for simple questions. Never write paragraphs.
2. For multi-step answers: bullet points only, max 5 bullets, each under 10 words.
3. START your reply immediately. Zero filler. No "Sure!", "Great question!", "Certainly!", "Of course!", "I'd be happy to help!", "Absolutely!" — banned.
4. Do NOT repeat the user's question back. Just answer it.
5. Do NOT add conclusions or summaries after your answer. Stop when done.
6. Spiritual phrases ("Praise the Lord", "God bless") — use ONLY if spiritually relevant, max once per session.
7. If you can say it in one sentence — USE ONE SENTENCE.
8. Write like a smart friend texting you back, not an AI writing an essay.

━━ CHURCH DETAILS ━━
Name: Kingdom of Christ Ministries (KCM)
Address: 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, Telangana 500055
Senior Pastor: Bishop Kurra Kristhu Raju
Contacts: 97040 90069 (Senior Pastor) | 73964 33856
NGO: KCM Social Service, Regd No: 206/2024 — hospital outreach, food kits, handicap care

━━ SERVICE SCHEDULE ━━
Sunday:    5:45 AM Watch Tower | 8:30 AM Sunday Service | 10:00 AM Pastor's Message
Wednesday: 6:30 PM Prayer Meeting
Thursday:  7:00 AM & 10:00 AM Fasting Prayer | 6:30 PM Oil Anointing Prayer
Saturday:  6:30 PM Special Meeting
Monthly:   1st Sunday → Water Baptism | 4th Sunday 6:30 PM → Youth Service

━━ WEBSITE ━━
/ Home | /ngo NGO | /ngo/donations Donate (UPI, 80G exempt) | /ngo/volunteers Join | /gallery Photos | /login Login

━━ CAPABILITIES ━━
Answer ANY question: Bible, faith, coding, science, health, cooking, travel, life advice, general knowledge — everything.
For non-church topics: give direct helpful answers. Do NOT inject religion unless asked.

━━ BANNED BEHAVIORS ━━
✗ Long paragraphs
✗ Filler openers
✗ Repeating the question
✗ Unnecessary disclaimers
✗ Fake humility ("As an AI, I...")
✗ Refusing legitimate questions

━━ LANGUAGE ━━
Telugu message → reply fully in Telugu. Hindi → Hindi. Mixed → mirror their style.`;

// ── POST /api/chat ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, RL_OPTS);

  if (isRateLimited(ip, RL_OPTS)) {
    return new Response(
      JSON.stringify({ error: 'Too many messages. Please wait a minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rlHeaders, 'Retry-After': '60' } }
    );
  }

  const body = await safeJson<unknown>(req);
  if (!body) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid message format' }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages } = parsed.data;
  const safeMessages = messages.filter((m) => m.role !== 'system');

  try {
    const apiKeys = [
      process.env.OPENROUTER_API_KEY,
      process.env.OPENROUTER_API_KEY_2,
      process.env.OPENROUTER_API_KEY_3,
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) throw new Error('API_KEY missing');

    const models = ['google/gemini-2.5-flash-lite', 'openai/gpt-4o-mini'];
    let response: Response | null = null;

    // Try keys & models with automatic failover
    for (const key of apiKeys) {
      for (const model of models) {
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://kcmchurch.vercel.app',
              'X-Title': 'KCM Assistant AI',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...safeMessages,
              ],
              max_tokens: 400,
              temperature: 0.3,
              stream: true,
            }),
          });

          if (res.ok) {
            response = res;
            break;
          }
        } catch {
          // Continue to next key/model
        }
      }
      if (response && response.ok) break;
    }

    if (!response || !response.ok) {
      const errText = response ? await response.text() : 'All API key failover attempts failed';
      throw new Error(`OpenRouter error: ${errText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) { controller.close(); return; }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (trimmed.startsWith('data: ')) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  const delta = data.choices?.[0]?.delta?.content;
                  if (delta) controller.enqueue(encoder.encode(`0:${JSON.stringify(delta)}\n`));
                } catch {}
              }
            }
          }
          // Flush any remaining buffer
          if (buffer.trim() && buffer.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(buffer.trim().slice(6));
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(`0:${JSON.stringify(delta)}\n`));
            } catch {}
          }
          controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
        ...rlHeaders,
      },
    });

  } catch (error: any) {
    console.error('[CHAT] Error:', error?.message);
    const message =
      error?.message?.includes('API_KEY') ? 'KCM Assistant is temporarily unavailable. Call us at 97040 90069.' :
      'Connection issue. Please try again in a moment.';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
