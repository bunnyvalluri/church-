/**
 * backend/src/services/churchChatbotService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * RAG-powered Conversational Church Chatbot for KCM Ministries Platform.
 * Capabilities:
 *   1. Event Questions (Queries upcoming events from PostgreSQL)
 *   2. Sermon Questions (Queries preaching series & sermons from PostgreSQL)
 *   3. Donation Questions (Queries UPI ID, 80G tax exemption, & giving channels)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const prisma = require('../utils/db');
const { generateCompletion } = require('./llmProviderEngine');
const { moderateContent } = require('./moderationEngine');

const SYSTEM_CHURCH_CHATBOT = `You are the Official AI Assistant for Kingdom of Christ Ministries (KCM).
Your persona is warm, welcoming, respectful, and pastorally caring.
Use the provided real-time church data context to accurately answer questions regarding upcoming events, sermon series, giving/donations, 80G tax receipts, and church locations.
If the user asks a question not answered in the context, provide a polite, helpful response and invite them to contact church leaders at kingofchristministries23@gmail.com or +91 97040 90069.`;

/**
 * Fetch dynamic context from PostgreSQL database
 */
async function fetchChurchContext() {
  let contextText = '';

  try {
    // 1. Fetch upcoming published events
    if (prisma.event) {
      const events = await prisma.event.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'asc' },
        take: 5
      });

      if (events.length > 0) {
        contextText += `\n--- UPCOMING CHURCH EVENTS ---\n`;
        events.forEach(e => {
          const dateStr = e.date ? new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA';
          contextText += `• Title: ${e.title}\n  Date: ${dateStr} at ${e.time || 'TBA'}\n  Location: ${e.location}\n  Category: ${e.category}\n  Description: ${e.shortDescription || e.description?.slice(0, 150)}\n\n`;
        });
      }
    }

    // 2. Fetch recent sermons
    if (prisma.sermon) {
      const sermons = await prisma.sermon.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'desc' },
        take: 5
      });

      if (sermons.length > 0) {
        contextText += `\n--- RECENT SERMONS & TEACHINGS ---\n`;
        sermons.forEach(s => {
          const dateStr = s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA';
          contextText += `• Title: "${s.title}" preached by ${s.speaker}\n  Passage: ${s.bibleVerse || 'Scripture Study'}\n  Date Preached: ${dateStr}\n  Category: ${s.category}\n  Summary: ${s.shortDescription || s.description?.slice(0, 150)}\n\n`;
        });
      }
    }

    // 3. Fetch Church Settings & Giving Information
    if (prisma.churchSettings) {
      const settings = await prisma.churchSettings.findUnique({
        where: { id: 'settings' }
      });

      contextText += `\n--- CHURCH BRANDING & DONATION INFORMATION ---\n`;
      contextText += `• Church Name: ${settings?.churchName || 'Kingdom of Christ Ministries'}\n`;
      contextText += `• Address: ${settings?.address || '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055'}\n`;
      contextText += `• Phone: ${settings?.contactPhone || '+91 97040 90069'}\n`;
      contextText += `• Email: ${settings?.primaryEmail || 'kingofchristministries23@gmail.com'}\n`;
      contextText += `• Official UPI ID: ${settings?.upiId || 'kcm.kristhraj2004-1@okicici'}\n`;
      contextText += `• Merchant Name: ${settings?.merchantName || 'Kingdom of Christ Ministries'}\n`;
      contextText += `• 80G Tax Exemption Status: 100% Tax Deductible registered under ${settings?.eightygRegistrationNo || 'DIT(E)/80G/HYDTSC/2023-24'}. Donors receive instant PDF tax receipts.\n`;
    }

    // 4. Fetch Donation Purposes
    if (prisma.donationPurpose) {
      const purposes = await prisma.donationPurpose.findMany({
        where: { isActive: true },
        take: 6
      });

      if (purposes.length > 0) {
        contextText += `\n--- ACTIVE GIVING CAUSES & PURPOSES ---\n`;
        purposes.forEach(p => {
          contextText += `• Cause: ${p.nameEn} (Code: ${p.code}) - ${p.descEn || ''}\n`;
        });
      }
    }

  } catch (err) {
    console.warn('[CHURCH_CHATBOT] Database context fetch note:', err.message);
  }

  if (!contextText) {
    contextText += `\n--- DEFAULT CHURCH INFORMATION ---\n`;
    contextText += `• Church Name: Kingdom of Christ Ministries\n`;
    contextText += `• Official UPI ID: kcm.kristhraj2004-1@okicici\n`;
    contextText += `• 80G Tax Exemption: All offerings & donations qualify for 80G Tax Exemption receipts.\n`;
    contextText += `• Contact Phone: +91 97040 90069 | Email: kingofchristministries23@gmail.com\n`;
  }

  return contextText;
}

/**
 * Handle Conversational Chat Request
 */
async function askChatbot({ userQuery, conversationHistory = [] }) {
  // 1. Content Moderation
  const moderation = moderateContent(userQuery);
  if (moderation.isFlagged && moderation.crisisDetected) {
    return {
      success: true,
      answer: `We care deeply about you. If you are going through a difficult time or having thoughts of harming yourself, please know that you are not alone. Please call or text the emergency helpline immediately at 988 (US) or 14416 (India Tele-MANAS). Our pastoral care team is also available to pray with you at +91 97040 90069. May God comfort your heart.`,
      moderation,
      isCrisis: true
    };
  }

  // 2. Fetch Live Database Context
  const churchContext = await fetchChurchContext();

  // 3. Format Messages
  let fullPrompt = `REAL-TIME CHURCH DATABASE CONTEXT:\n${churchContext}\n\n`;

  if (conversationHistory.length > 0) {
    fullPrompt += `PREVIOUS CONVERSATION HISTORY:\n`;
    conversationHistory.slice(-4).forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    });
    fullPrompt += `\n`;
  }

  fullPrompt += `USER QUESTION: "${userQuery}"\n\nProvide a warm, precise, and helpful response:`;

  // 4. Generate Completion
  const completion = await generateCompletion(fullPrompt, SYSTEM_CHURCH_CHATBOT);

  const defaultAnswer = completion.text ||
    `Welcome to Kingdom of Christ Ministries! You can check our upcoming events, listen to sermons, or support our ministry via UPI (kcm.kristhraj2004-1@okicici). For further details, please reach out to us at +91 97040 90069!`;

  return {
    success: true,
    answer: defaultAnswer,
    moderation,
    meta: completion
  };
}

module.exports = {
  askChatbot,
  fetchChurchContext
};
