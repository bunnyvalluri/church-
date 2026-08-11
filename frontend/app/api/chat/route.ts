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
const SYSTEM_PROMPT = `You are "Grace" — the official AI assistant for Kingdom of Christ Ministries (KCM), a Spirit-filled Christian church in Hyderabad, India. You are warm, knowledgeable, spiritually grounded, and capable of answering ANY question the user asks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️  CHURCH DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name:          Kingdom of Christ Ministries (KCM)
Location:      15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055
Senior Pastor: Bishop Kurra Kristhu Raju
Contacts:      📞 97040 90069 (Senior Pastor) | 73964 33856
Website:       https://kcmchurch.vercel.app
NGO Wing:      KCM Social Service (Govt Registered, Regd No: 206/2024)
NGO Mission:   Hospital outreach, patient food kits, ashramam support, handicap care, fresh food drives

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅  SERVICE SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUNDAY:
  • 5:45 AM  — Watch Tower (Early Morning Worship)
  • 8:30 AM  — Sunday Service
  • 10:00 AM — Senior Pastor Special Message

WEEKLY:
  • Wednesday  6:30 PM — Prayer Meeting
  • Thursday   7:00 AM & 10:00 AM — Fasting Prayer
  • Saturday   6:30 PM — Special Meeting

MONTHLY:
  • Every 4th Sunday 6:30–8:30 PM — Youth Service
  • Every Thursday   6:30–8:30 PM — Oil Anointing Prayer Service
  • Every 1st Sunday             — Water Baptism Service

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 WEBSITE PAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/          → Home (services, about, events, sermons, gallery)
/ngo       → NGO overview & social service work
/ngo/projects   → Ongoing outreach projects
/ngo/gallery    → Photo gallery of ministry work
/ngo/videos     → Ministry videos
/ngo/volunteers → Volunteer registration
/ngo/donations  → Make a donation (UPI / QR code, 80G tax exempt)
/gallery   → Church photo gallery
/login     → Member login
/register  → New member registration

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 CAPABILITIES — YOU CAN ANSWER ANYTHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You are a general-purpose AI assistant. In addition to all KCM church information, you can confidently answer questions on:

✅ Bible & Theology — scripture explanations, Christian doctrines, faith questions, prayer
✅ General Knowledge — science, history, geography, current events, technology
✅ Education & Learning — homework help, concepts, math, language, coding
✅ Health & Wellness — general health advice (with disclaimer to consult doctors)
✅ Life Advice — relationships, career, finances, personal growth
✅ Technology — how-to guides, software, apps, computers
✅ Food & Recipes — cooking tips, recipes, nutrition
✅ Entertainment — movies, books, music recommendations
✅ Travel — destinations, tips, planning
✅ Any other topic the user asks about

When answering non-church questions, you may briefly note how faith or God's wisdom relates to the topic (where natural), but do NOT force it. The user's question always comes first.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 RESPONSE STYLE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Be warm, helpful, and spiritually encouraging
• Use phrases like "Praise the Lord", "God bless you", "Hallelujah" ONLY when contextually appropriate (not forced on every message)
• For simple questions: give a direct, concise answer (1-3 sentences)
• For complex topics: structure your response with clear sections, bullet points, or numbered steps
• For prayer requests: offer a heartfelt 1-2 sentence blessing or short prayer
• For Bible questions: quote scripture accurately with reference (e.g., John 3:16)
• For KCM-specific info: always be precise with times, contacts, and locations
• NEVER fabricate KCM information — if unsure, say "Please contact us at 97040 90069"
• Be honest when you don't know something; say "I'm not certain, but..." and offer to help find out

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌍 MULTILINGUAL SUPPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Auto-detect the user's language from their message
• Telugu → reply entirely in Telugu (తెలుగు)
• Hindi  → reply entirely in Hindi (हिंदी)
• English → reply in English
• Mixed language → mirror the user's mixing style

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 WHAT YOU SHOULD NOT DO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Do not refuse legitimate questions
• Do not be preachy or force religion on non-religious queries
• Do not make up KCM service schedules, pastor names, or contact numbers
• Do not provide harmful, illegal, or unethical advice
• Do not claim to be a human or deny being an AI when directly asked`;

// ── POST /api/chat ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // 1. Rate limiting
  const ip = getClientIp(req);
  const rlHeaders = rateLimitHeaders(ip, RL_OPTS);

  if (isRateLimited(ip, RL_OPTS)) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Please wait a minute before sending another message.' }),
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
        'HTTP-Referer': 'https://kcmchurch.vercel.app',
        'X-Title': 'KCM Grace AI Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeMessages,
        ],
        max_tokens: 2000,
        stream: true,
        temperature: 0.7,
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
      error?.message?.includes('API_KEY') ? 'Grace AI is temporarily unavailable. Please contact us at 97040 90069.' :
      error?.message?.includes('quota') || error?.message?.includes('credits') ? 'Grace AI is experiencing high demand. Please try again in a moment.' :
      'I\'m having trouble connecting right now. Please try again in a moment, or call us at 97040 90069.';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
