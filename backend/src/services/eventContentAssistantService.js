/**
 * backend/src/services/eventContentAssistantService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Event Content Assistant Service for KCM Ministries Platform.
 * Capabilities:
 *   1. Generate Event Descriptions & Titles
 *   2. Multi-Platform Social Captions (Instagram, Facebook, Twitter, WhatsApp)
 *   3. Generate Promotional Event Blog Posts in Markdown
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { generateCompletion, extractJSON } = require('./llmProviderEngine');

const SYSTEM_EVENT_ASSISTANT = `You are an Expert Church Marketing Director and Event Content Assistant for Kingdom of Christ Ministries (KCM).
Your goal is to create compelling, high-converting, and warm promotional content for church events, conferences, and outreach programs.`;

/**
 * Generate Event Descriptions & Catchy Titles
 */
async function generateEventDescription({ title = 'Church Revival Gathering', date = 'Upcoming Sunday', location = 'KCM Main Sanctuary', targetAudience = 'All Church Members & Community' }) {
  const prompt = `Generate event descriptions for church event: "${title}".
Date: ${date}
Location: ${location}
Target Audience: ${targetAudience}

Return JSON in this format:
{
  "title": "${title}",
  "catchyHeadlines": ["Headline 1", "Headline 2"],
  "shortDescription": "2-sentence compelling summary for event cards & flyers",
  "fullDescription": "Full detailed event description outlining vision, worship, message, fellowship, and registration call to action.",
  "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
}`;

  const completion = await generateCompletion(prompt, SYSTEM_EVENT_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.shortDescription) {
    return { success: true, data: parsed, meta: completion };
  }

  return {
    success: true,
    data: {
      title,
      catchyHeadlines: [`Experience Renewal at ${title}`, `Join Us for ${title} at KCM`],
      shortDescription: `Join Kingdom of Christ Ministries on ${date} at ${location} for an unforgettable gathering of faith and fellowship!`,
      fullDescription: `We warmly invite you, your family, and friends to ${title} at Kingdom of Christ Ministries! Prepare your hearts for an inspiring time of worship, uplifting spiritual messages, and warm community bonding. Whether you're seeking spiritual growth or community connection, God has a special blessing for you!`,
      keyHighlights: ['Anointed Live Worship & Praise', 'Impactful Word & Pastoral Message', 'Fellowship & Community Connections']
    },
    meta: completion
  };
}

/**
 * Generate Social Media Captions for All Platforms
 */
async function generateSocialCaptions({ title, description = '', date = '', location = '' }) {
  const prompt = `Generate engaging social media captions for church event: "${title}".
Details: ${description} | Date: ${date} | Location: ${location}

Return JSON in this exact format:
{
  "instagram": "Instagram post with line breaks, emojis, and relevant hashtags #KCM #ChurchEvent",
  "facebook": "Detailed Facebook post inviting families and community with event link placeholder",
  "twitter": "Short impactful tweet with call to action under 280 chars",
  "whatsapp": "Direct broadcast message with formatting for church WhatsApp groups"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_EVENT_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.instagram) {
    return { success: true, captions: parsed, meta: completion };
  }

  return {
    success: true,
    captions: {
      instagram: `🔥 Mark your calendars! Join us for *${title}* at KCM Ministries! 🙌✨\n\nDate: ${date}\nLocation: ${location}\n\nExperience inspiring worship and a life-changing message! Tap the link in our bio to learn more and register! 🙏 #KCM #KingdomOfChrist #ChurchRevival #Faith`,
      facebook: `📢 COMMUNITY ANNOUNCEMENT: You are warmly invited to *${title}* at Kingdom of Christ Ministries!\n\nJoin us on ${date} at ${location} for an empowering session of praise, worship, and spiritual growth. Bring your family and friends along!\n\n👉 Learn more & register on our portal: https://kcm-ministries.org/events`,
      twitter: `⚡ Exciting news! Join us for ${title} on ${date} at ${location}! Experience anointed worship and inspiring preaching. Details: https://kcm-ministries.org/events 📖✨ #KCM`,
      whatsapp: `🙌 *Greetings KCM Family!*\n\nYou are cordially invited to *${title}*!\n🗓️ *Date:* ${date}\n📍 *Venue:* ${location}\n\nCome expectantly and bring a friend! God bless you abundantly!`
    },
    meta: completion
  };
}

/**
 * Generate Promotional Event Blog Post in Markdown
 */
async function generateEventBlog({ title, description = '', topic = '' }) {
  const prompt = `Write a comprehensive, SEO-optimized promotional blog post in Markdown format for the church event: "${title}".
Event Context: ${description || topic}

Return JSON:
{
  "blogTitle": "Catchy SEO Blog Title",
  "blogMarkdown": "Full 4-paragraph Markdown article inspiring attendance, incorporating scripture, event details, and closing prayer call to action."
}`;

  const completion = await generateCompletion(prompt, SYSTEM_EVENT_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.blogMarkdown) {
    return { success: true, blog: parsed, meta: completion };
  }

  const blogTitle = `Step Into Grace: Why You Shouldn't Miss ${title}`;
  const blogMarkdown = `# ${blogTitle}\n\n` +
    `At **Kingdom of Christ Ministries**, we believe that gathering together in faith releases extraordinary blessings. We are excited to announce our upcoming event: **${title}**!\n\n` +
    `### What to Expect\n` +
    `As scripture reminds us in *Hebrews 10:25*, let us not give up meeting together, but encourage one another. This event is designed to ignite your passion for God word, provide deep spiritual nourishment, and connect you with a vibrant community of believers.\n\n` +
    `### Event Highlights\n` +
    `- **Anointed Praise & Worship**\n` +
    `- **Transformational Pastoral Teaching**\n` +
    `- **Individual & Group Prayer Ministry**\n\n` +
    `### Join Us in Person\n` +
    `Whether you have been walking with God for decades or are taking your first steps in faith, you are welcome here. Invite your family, neighbors, and colleagues to experience God's love!`;

  return {
    success: true,
    blog: { blogTitle, blogMarkdown },
    meta: completion
  };
}

module.exports = {
  generateEventDescription,
  generateSocialCaptions,
  generateEventBlog
};
