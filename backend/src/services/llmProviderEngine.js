/**
 * backend/src/services/llmProviderEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Multi-Provider LLM Engine for KCM Ministries Platform.
 * Inspired by free LLM API resources (Groq, OpenRouter, Google AI Studio).
 * Features:
 *   - Automatic Fallback Cascade: Groq -> OpenRouter -> Google AI Studio -> Fallback
 *   - Zero exposed keys (Server-side execution only)
 *   - JSON mode parser & validation
 *   - Latency tracking & provider telemetry
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Provider API Keys from environment
const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Model Defaults
const GROQ_DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OPENROUTER_DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';
const GEMINI_DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Call Groq Chat Completions API
 */
async function callGroq(prompt, systemInstruction = '', options = {}) {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API Key (GROQ_API_KEY) is not configured.');
  }

  const model = options.model || GROQ_DEFAULT_MODEL;
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  };

  if (options.jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return {
    text,
    provider: 'Groq',
    modelName: model,
    usage: data.usage || {}
  };
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(prompt, systemInstruction = '', options = {}) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API Key (OPENROUTER_API_KEY) is not configured.');
  }

  const model = options.model || OPENROUTER_DEFAULT_MODEL;
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://kcm-ministries.org',
      'X-Title': 'KCM Ministries Church Platform'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  return {
    text,
    provider: 'OpenRouter',
    modelName: model,
    usage: data.usage || {}
  };
}

/**
 * Call Google AI Studio / Gemini API
 */
async function callGoogleAIStudio(prompt, systemInstruction = '', options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Google AI Studio API Key (GEMINI_API_KEY) is not configured.');
  }

  const modelName = options.model || GEMINI_DEFAULT_MODEL;
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction || undefined
  });

  const res = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2048,
    }
  });

  const text = res.response.text();
  return {
    text,
    provider: 'GoogleAIStudio',
    modelName,
    usage: {}
  };
}

/**
 * Execute LLM call with primary provider and cascading fallback options
 * Fallback Cascade: Groq -> OpenRouter -> Google AI Studio
 */
async function generateCompletion(prompt, systemInstruction = '', options = {}) {
  const startTime = Date.now();
  let errors = [];

  // 1. Try Groq
  if (GROQ_API_KEY && options.preferredProvider !== 'OpenRouter' && options.preferredProvider !== 'GoogleAIStudio') {
    try {
      const res = await callGroq(prompt, systemInstruction, options);
      const latencyMs = Date.now() - startTime;
      return { ...res, latencyMs };
    } catch (err) {
      console.warn(`[LLM_ENGINE] Groq call failed (${err.message}). Cascading to OpenRouter...`);
      errors.push({ provider: 'Groq', message: err.message });
    }
  }

  // 2. Try OpenRouter
  if (OPENROUTER_API_KEY && options.preferredProvider !== 'GoogleAIStudio') {
    try {
      const res = await callOpenRouter(prompt, systemInstruction, options);
      const latencyMs = Date.now() - startTime;
      return { ...res, latencyMs };
    } catch (err) {
      console.warn(`[LLM_ENGINE] OpenRouter call failed (${err.message}). Cascading to Google AI Studio...`);
      errors.push({ provider: 'OpenRouter', message: err.message });
    }
  }

  // 3. Try Google AI Studio (Gemini)
  if (GEMINI_API_KEY) {
    try {
      const res = await callGoogleAIStudio(prompt, systemInstruction, options);
      const latencyMs = Date.now() - startTime;
      return { ...res, latencyMs };
    } catch (err) {
      console.warn(`[LLM_ENGINE] Google AI Studio call failed (${err.message}).`);
      errors.push({ provider: 'GoogleAIStudio', message: err.message });
    }
  }

  const latencyMs = Date.now() - startTime;
  console.warn('[LLM_ENGINE] All external LLM providers unavailable or unconfigured. Returning fallback system response.');

  return {
    text: '',
    provider: 'SystemFallback',
    modelName: 'internal-rule-engine',
    latencyMs,
    errors
  };
}

/**
 * Helper to safely extract JSON object from LLM response markdown or text
 */
function extractJSON(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) {
        return null;
      }
    }
    return null;
  }
}

module.exports = {
  generateCompletion,
  callGroq,
  callOpenRouter,
  callGoogleAIStudio,
  extractJSON
};
