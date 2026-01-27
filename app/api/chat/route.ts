import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { CHURCH_CONTEXT } from '@/lib/knowledge';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: Request) {
  // Check for API Key
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing OPENAI_API_KEY in .env.local" }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: 'system', content: CHURCH_CONTEXT },
        ...messages
      ],
      temperature: 0.7,
    });

    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error('AI Error:', error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
