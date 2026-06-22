import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp, safeJson } from '@/lib/apiResponse';
import { z } from 'zod';

// ── Validation ────────────────────────────────────────────────────────────────
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000).trim(),
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

// ── Rate limit config ─────────────────────────────────────────────────────────
const RL_OPTS = { windowMs: 60_000, maxRequests: 15 };

// ── KCM System Prompt ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a helpful, spiritual, and welcoming assistant for Kingdom of Christ Ministries (KCM), a Christian church in Hyderabad, India.

CHURCH DETAILS:
- Name: Kingdom of Christ Ministries (KCM)
- Address: 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055
- Senior Pastor: Bishop Kurra Kristhu Raju
- Contact: 97040 90069 (Senior Pastor) | 96409 43777 | 73964 33856

SERVICE SCHEDULE:
Sunday:
  • 5:45 AM  — Watch Tower (Early Morning Worship)
  • 8:30 AM  — Sunday Service
  • 10:00 AM — Senior Pastor Special Message
  • 10:30 AM — Youth Service

Weekly:
  • Wednesday  6:30 PM — Prayer Meeting
  • Thursday   7:00 AM & 10:00 AM — Fasting Prayer
  • Saturday   6:30 PM — Special Meeting

Monthly:
  • 3rd Friday 4:00 PM — Healing Worship
  • 1st Sunday           — Water Baptism Service

GUIDELINES:
- Be warm, spiritual, and welcoming in every response.
- Use phrases like "Praise the Lord", "God bless you", "Hallelujah" naturally.
- Keep answers extremely short, direct, and under 2-3 sentences max. Answer user questions instantly and avoid verbose descriptions so answers are quick to read.
- For prayer requests, offer a very short 1-sentence prayer or blessing.
- Do NOT make up information not listed above.
- If you don't know something, say "Please contact us at 97040 90069 (Senior Pastor)"

MULTILINGUAL:
- Detect the user's language automatically
- If Telugu → reply entirely in Telugu (తెలుగు)
- If Hindi  → reply entirely in Hindi (हिंदी)
- If English → reply in English
- Mix languages only if the user mixes them`;

// ── POST /api/chat ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // 1. Rate limiting
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, RL_OPTS);

  if (isRateLimited(ip, RL_OPTS)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', ...rlHeaders, 'Retry-After': '60' } }
    );
  }

  // 2. Parse body
  const body = await safeJson<unknown>(req);
  if (!body) {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. Validate
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid message format', details: parsed.error.errors }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages } = parsed.data;
  const safeMessages = messages.filter((m) => m.role !== 'system');

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('API_KEY missing');
    }

    // 4. Call OpenRouter with streaming enabled
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter returned status ${response.status}: ${errText}`);
    }

    // 5. Stream the response back in Vercel AI SDK format
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    let buffer = '';

    const stream = new ReadableStream({
      async start(controller) {
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed === 'data: [DONE]') continue;

              if (trimmed.startsWith('data: ')) {
                const jsonStr = trimmed.slice(6);
                try {
                  const data = JSON.parse(jsonStr);
                  const delta = data.choices?.[0]?.delta?.content;
                  if (delta) {
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(delta)}\n`));
                  }
                } catch (e) {
                  console.error('[CHAT] Error parsing SSE line:', trimmed, e);
                }
              }
            }
          }

          // Signal end of stream
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
    console.error('[CHAT] OpenRouter error:', error?.message || error);

    const message =
      error?.message?.includes('API_KEY') ? 'AI service configuration error. Please contact support.' :
      error?.message?.includes('quota') || error?.message?.includes('credits') ? 'AI service is busy. Please try again in a moment.' :
      'I am having trouble connecting right now. Please try again later.';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
