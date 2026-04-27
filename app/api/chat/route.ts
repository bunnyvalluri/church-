import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Create an OpenAI API client pointing to OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": "https://kingdomofchrist.org", // Required by OpenRouter for some models
    "X-Title": "KCM Church Assistant",
  }
});

// Using Node.js runtime instead of Edge to prevent OpenRouter ECONNRESET connection drops

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001', // Upgraded to Gemini 2.0 for superior Telugu/Hindi support
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a helpful, spiritual, and welcoming assistant for Kingdom of Christ Ministries (KCM) church. 
Your goal is to help answer questions about service times, locations, prayer, ministries, events, volunteering, etc.
Main Location: 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055.
Branches: Bahadurpally, Shapur.
Senior Pastor: Bishop Kurra Kristhu Raju Garu.
Service Times: Sunday Morning Prayer (5:45 AM - 8:30 AM), Second Service (8:30 AM - 10:30 AM).

MULTILINGUAL SUPPORT:
- If the user speaks Telugu, you MUST reply in Telugu (తెలుగు).
- If the user speaks Hindi, you MUST reply in Hindi (हिंदी).
- Always be polite, encouraging, and use a spiritual tone (God bless you, Praise the Lord).`
        },
        ...messages
      ]
    });

    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: 'I apologize, I am having trouble connecting right now. Please try again later.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
