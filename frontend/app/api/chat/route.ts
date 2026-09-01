export const dynamic = 'force-dynamic';

import { getAuthenticatedUser } from '@/lib/authMiddleware';
import { isRateLimited, rateLimitHeaders } from '@/lib/rateLimit';
import { getClientIp, safeJson } from '@/lib/apiResponse';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  normalizeUserInput,
  evaluatePromptSecurity,
  redactSensitiveOutput,
  buildSecureContext,
} from '@/lib/ai/aiSecurityPipeline';
import { executeAITool, AI_TOOL_REGISTRY } from '@/lib/ai/aiToolsRegistry';

// ── Validation Schema ───────────────────────────────────────────────────────────
const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(4000).trim(),
});

const chatRequestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(30),
  mode: z.enum(['CHURCH', 'BIBLE', 'GENERAL']).default('CHURCH'),
  language: z.enum(['en', 'te', 'hi']).default('en'),
  toolCall: z
    .object({
      name: z.string(),
      parameters: z.record(z.any()).optional(),
    })
    .optional(),
});

// ── Multi-Tier Rate Limiting Configuration ─────────────────────────────────────
const RATE_LIMIT_TIERS: Record<string, { windowMs: number; maxRequests: number }> = {
  PUBLIC: { windowMs: 60_000, maxRequests: 10 },
  MEMBER: { windowMs: 60_000, maxRequests: 30 },
  PASTOR: { windowMs: 60_000, maxRequests: 60 },
  ADMIN: { windowMs: 60_000, maxRequests: 100 },
  SUPER_ADMIN: { windowMs: 60_000, maxRequests: 100 },
};

// ── Helper: Crisis Detection ───────────────────────────────────────────────────
function checkCrisisKeywords(text: string): boolean {
  const crisisRegex = /(suicide|kill\s+myself|end\s+my\s+life|self[- ]harm|आत्महत्या|చనిపోవాలని|ఆత్మహత్య)/i;
  return crisisRegex.test(text);
}

// ── POST /api/chat ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const ip = getClientIp(req);

  // 1. Authenticate Request & Derive Server-Side Role
  const authUser = await getAuthenticatedUser(req);
  const userRole = authUser?.role || 'PUBLIC';
  const rlConfig = RATE_LIMIT_TIERS[userRole] || RATE_LIMIT_TIERS.PUBLIC;
  const rlKey = authUser ? `user:${authUser.uid}` : `ip:${ip}`;
  const rlHeaders = rateLimitHeaders(rlKey, rlConfig);

  // 2. Multi-Tier Rate Limiting
  if (isRateLimited(rlKey, rlConfig)) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please wait a moment before sending more messages.',
        role: userRole,
      }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json', ...rlHeaders, 'Retry-After': '60' },
      }
    );
  }

  // 3. Parse & Validate Request Body
  const body = await safeJson<unknown>(req);
  if (!body) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid message format or parameters.', details: parsed.error.issues }),
      { status: 422, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages, mode, language, toolCall } = parsed.data;

  // 4. Handle Direct Tool Invocations (if requested)
  if (toolCall) {
    const toolResult = await executeAITool(toolCall.name, toolCall.parameters, authUser);
    return new Response(JSON.stringify(toolResult), {
      status: toolResult.success ? 200 : 403,
      headers: { 'Content-Type': 'application/json', ...rlHeaders },
    });
  }

  // Extract latest user message
  const userMessages = messages.filter((m) => m.role === 'user');
  const latestMessage = userMessages[userMessages.length - 1];
  if (!latestMessage) {
    return new Response(
      JSON.stringify({ error: 'At least one user message is required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 5. Layer 1 & 2: Input Normalization & Prompt Security Evaluation
  const normalizedText = normalizeUserInput(latestMessage.content);
  const securityCheck = evaluatePromptSecurity(normalizedText);

  // Crisis Intervention Check
  if (checkCrisisKeywords(normalizedText)) {
    const crisisReply =
      language === 'te'
        ? `మేము మీ కోసం ప్రార్థిస్తున్నాము. దయచేసి బాధలో ఒంటరిగా ఉండకండి. తక్షణ సహాయం కోసం నేషనల్ హెల్ప్‌లైన్ 14416 (Tele-MANAS) కు కాల్ చేయండి. మా పాస్టరల్ కేర్ టీమ్ ఫోన్: 97040 90069. దేవుడు మీకు శాంతిని అనుగ్రహించును గాక.`
        : language === 'hi'
        ? `हम आपकी बहुत परवाह करते हैं। कृपया कठिन समय में अकेले न रहें। तुरंत सहायता के लिए राष्ट्रीय हेल्पलाइन 14416 (Tele-MANAS) पर संपर्क करें। हमारी पादरी टीम का फोन: 97040 90069 है। प्रभु आपको शांति दें।`
        : `We care deeply about you. You are never alone. If you are going through a difficult time, please call the emergency mental health helpline immediately at 14416 (India Tele-MANAS) or 988 (US). Our pastoral prayer team is also available at +91 97040 90069. May God comfort and protect you.`;

    return new Response(
      `0:${JSON.stringify(crisisReply)}\nd:{"finishReason":"stop"}\n`,
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
          ...rlHeaders,
        },
      }
    );
  }

  // Refuse High-Confidence Jailbreaks & System Prompt Extractions
  if (securityCheck.isSuspicious && securityCheck.reasons.includes('system_prompt_extraction')) {
    const safeRefusal =
      language === 'te'
        ? 'నేను KCM అసిస్టెంట్‌ని. చర్చి సమాచారం, బైబిల్ ప్రశ్నలకు సమాధానం ఇవ్వగలను, కానీ అంతర్గత సిస్టమ్ వివరాలను వెల్లడించలేను.'
        : language === 'hi'
        ? 'मैं KCM सहायक हूँ। मैं चर्च और बाइबिल से जुड़े सवालों में मदद कर सकता हूँ, लेकिन आंतरिक सिस्टम निर्देश साझा नहीं कर सकता।'
        : 'I am KCM Assistant. I can help you with church details, services, and Bible questions, but I cannot provide private system instructions or internal credentials.';

    return new Response(
      `0:${JSON.stringify(safeRefusal)}\nd:{"finishReason":"stop"}\n`,
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Vercel-AI-Data-Stream': 'v1',
          ...rlHeaders,
        },
      }
    );
  }

  // 6. Build Live Church Context safely
  let publicChurchData = `CHURCH DETAILS:
- Name: Kingdom of Christ Ministries (KCM), Hyderabad
- Senior Pastor: Bishop Kurra Kristhu Raju
- Address: 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, Telangana 500055
- Contact Phone: +91 97040 90069 / 73964 33856
- Official UPI ID: kcm.kristhraj2004-1@okicici (80G Tax Exemption Available)
- NGO Regd No: 206/2024 (KCM Social Service)
- Services: Sunday 5:45 AM, 8:30 AM, 10:00 AM | Wednesday 6:30 PM | Thursday 7 AM, 10 AM, 6:30 PM | Saturday 6:30 PM`;

  try {
    const [events, sermons] = await Promise.all([
      prisma.event.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'asc' },
        take: 3,
        select: { title: true, date: true, time: true, location: true },
      }),
      prisma.sermon.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'desc' },
        take: 3,
        select: { title: true, speaker: true, bibleVerse: true },
      }),
    ]);

    if (events.length > 0) {
      publicChurchData += `\n\nUPCOMING EVENTS:\n` + events.map((e) => `• ${e.title} on ${new Date(e.date).toDateString()} at ${e.time || 'TBA'}`).join('\n');
    }
    if (sermons.length > 0) {
      publicChurchData += `\n\nRECENT SERMONS:\n` + sermons.map((s) => `• "${s.title}" preached by ${s.speaker} (${s.bibleVerse || 'Scripture'})`).join('\n');
    }
  } catch {
    // Graceful fallback to static details
  }

  // 7. Layer 5: Build XML-Bounded Secure Context
  const secureSystemPrompt = buildSecureContext({
    userRole,
    userName: authUser?.name,
    userEmail: authUser?.email,
    language,
    mode,
    publicChurchData,
  });

  const safeConversation = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-6)
    .map((m) => ({
      role: m.role,
      content: normalizeUserInput(m.content),
    }));

  try {
    const apiKeys = [
      process.env.OPENROUTER_API_KEY,
      process.env.OPENROUTER_API_KEY_2,
      process.env.OPENROUTER_API_KEY_3,
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
      throw new Error('API_KEY missing');
    }

    const models = ['google/gemini-2.5-flash-lite', 'openai/gpt-4o-mini'];
    let upstreamRes: Response | null = null;

    // Failover loop with timeout
    for (const key of apiKeys) {
      for (const model of models) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://kcmchurch.vercel.app',
              'X-Title': 'KCM Assistant AI',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: secureSystemPrompt },
                ...safeConversation,
              ],
              max_tokens: 350,
              temperature: 0.3,
              stream: true,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            upstreamRes = res;
            break;
          }
        } catch {
          // Continue to next model/key
        }
      }
      if (upstreamRes && upstreamRes.ok) break;
    }

    if (!upstreamRes || !upstreamRes.ok) {
      throw new Error('AI provider service temporarily unavailable.');
    }

    // 8. Stream & Output Redaction Layer
    const reader = upstreamRes.body?.getReader();
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
              if (!trimmed || trimmed === 'data: [DONE]') continue;
              if (trimmed.startsWith('data: ')) {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  const delta = data.choices?.[0]?.delta?.content;
                  if (delta) {
                    // Apply Layer 3: Output Redaction Filter
                    const { redactedText } = redactSensitiveOutput(delta);
                    controller.enqueue(encoder.encode(`0:${JSON.stringify(redactedText)}\n`));
                  }
                } catch {}
              }
            }
          }

          if (buffer.trim() && buffer.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(buffer.trim().slice(6));
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) {
                const { redactedText } = redactSensitiveOutput(delta);
                controller.enqueue(encoder.encode(`0:${JSON.stringify(redactedText)}\n`));
              }
            } catch {}
          }

          controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
          controller.close();
        } catch (streamErr) {
          controller.error(streamErr);
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
    console.error('[CHAT_API] Error notice:', error?.message);
    const message =
      language === 'te'
        ? 'KCM అసిస్టెంట్ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి 97040 90069 కు కాల్ చేయండి.'
        : language === 'hi'
        ? 'KCM सहायक अस्थायी रूप से अनुपलब्ध है। कृपया 97040 90069 पर संपर्क करें।'
        : 'KCM Assistant is temporarily unavailable. Please call us at 97040 90069 or try again shortly.';

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...rlHeaders } }
    );
  }
}
