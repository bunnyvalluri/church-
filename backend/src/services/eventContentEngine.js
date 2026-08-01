/**
 * backend/src/services/eventContentEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Event Content Generator powered by Firecrawl & Gemini AI.
 *   - Analyzes church event topics via Firecrawl web intelligence
 *   - Generates social media captions (Instagram, Facebook, Twitter, WhatsApp)
 *   - Generates promotional blog post HTML/Markdown
 *   - Integrates with Cloudinary banner media
 *   - Stores in Neon PostgreSQL (EventContentGenLog)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const firecrawlService = require('./firecrawlService');

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
let genAI = null;
if (GEMINI_KEY) {
  try { genAI = new GoogleGenerativeAI(GEMINI_KEY); } catch (e) {}
}

async function generateEventContent(eventId = null, eventTopic = 'Youth Revival Conference') {
  console.log(`[EVENT_CONTENT_GEN] Generating multi-channel content for topic: "${eventTopic}"`);

  // Step 1: Firecrawl Web Research on Event Topic Trends
  const firecrawlResearch = await firecrawlService.searchWeb(`${eventTopic} church event promotion youth worship`, { limit: 3 });
  let backgroundContext = '';
  if (firecrawlResearch.success && Array.isArray(firecrawlResearch.data)) {
    backgroundContext = firecrawlResearch.data.map(d => d.snippet || '').join('\n');
  }

  // Step 2: AI Generation for Social Captions & Blog
  let socialCaptions = {};
  let blogTitle = `Join Us: ${eventTopic} at KCM Ministries`;
  let blogMarkdown = '';

  const prompt = `Act as an expert Church Marketing & Social Media Director for KCM Ministries.
Generate engaging promotional social media captions and a blog post for the upcoming event: "${eventTopic}".
Context from Web Intelligence: ${backgroundContext.slice(0, 1000)}

Return JSON in this format:
{
  "blogTitle": "Catchy & Powerful Blog Post Title",
  "blogMarkdown": "Full 4-paragraph blog article inspiring attendance, giving location details, and closing with prayer.",
  "socialCaptions": {
    "instagram": "Instagram post with emojis & hashtags #KCM #Revival",
    "facebook": "Facebook community announcement with event details",
    "twitter": "Short impactful tweet with call to action",
    "whatsapp": "Direct broadcast message for church WhatsApp group"
  }
}`;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        blogTitle = parsed.blogTitle || blogTitle;
        blogMarkdown = parsed.blogMarkdown || blogMarkdown;
        socialCaptions = parsed.socialCaptions || socialCaptions;
      }
    } catch (err) {
      console.warn('[EVENT_CONTENT_GEN] Gemini generation warning:', err.message);
    }
  }

  if (!blogMarkdown) {
    blogMarkdown = `# ${blogTitle}\n\n` +
      `We are thrilled to invite you to our upcoming event: **${eventTopic}**!\n\n` +
      `Prepare your hearts for an extraordinary encounter with God's word, vibrant worship, and uplifting fellowship. ` +
      `Whether you have been part of our community for years or are visiting for the first time, there is a place for you.\n\n` +
      `### Event Details & Highlights\n` +
      `- **Keynote Speaker & Pastoral Message**\n` +
      `- **Live Worship & Praise**\n` +
      `- **Prayer Support & Community Fellowship**\n\n` +
      `*Don't miss this powerful gathering. Invite your friends, family, and neighbors!*`;

    socialCaptions = {
      instagram: `🔥 Get Ready! Join us for ${eventTopic} at KCM Ministries! Experiencing faith, worship, and breakthrough togetherness. Tap the link in bio to register! 🙏✨ #KCM #ChurchEvent #FaithRevival`,
      facebook: `📢 COMMUNITY ANNOUNCEMENT: You are cordially invited to ${eventTopic}! Join us at Kingdom of Christ Ministries for an uplifting session of worship, community bonding, and inspiring messages. Everyone is welcome!`,
      twitter: `⚡ Exciting news! Join us for ${eventTopic} at KCM Ministries. Experience powerful worship and community! Details: https://kcm-ministries.org/events 📖✨`,
      whatsapp: `🙌 *Greetings Church Family!* You're invited to *${eventTopic}*. Bring a friend along! Date & location available on our portal. God bless you!`
    };
  }

  // Cloudinary Banner URL fallback/integration
  const bannerImageUrl = 'https://res.cloudinary.com/demo/image/upload/v1680000000/kcm_event_banner.jpg';

  // Step 3: Persist in Neon Postgres
  const log = await prisma.eventContentGenLog.create({
    data: {
      eventId: eventId || null,
      topic: eventTopic,
      targetAudience: 'Church Members, Youth & Community Guests',
      socialCaptions,
      blogTitle,
      blogMarkdown,
      bannerImageUrl,
      cloudinaryId: 'kcm_event_banner'
    }
  });

  return log;
}

module.exports = {
  generateEventContent
};
