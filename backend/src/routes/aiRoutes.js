/**
 * backend/src/routes/aiRoutes.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Express API Router for KCM Ministries AI Features Suite.
 * Covers:
 *   - Sermon Assistant
 *   - Prayer Assistant
 *   - Event Content Assistant
 *   - Bible Study Assistant
 *   - Church Chatbot (RAG powered)
 *   - Audit Logging & Telemetry in PostgreSQL (AIChatLog)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const prisma = require('../utils/db');

const sermonAssistant = require('../services/sermonAssistantService');
const prayerAssistant = require('../services/prayerAssistantService');
const eventContentAssistant = require('../services/eventContentAssistantService');
const bibleStudyAssistant = require('../services/bibleStudyAssistantService');
const churchChatbot = require('../services/churchChatbotService');
const { moderateContent } = require('../services/moderationEngine');

/**
 * Helper to persist audit log into PostgreSQL
 */
async function logAIChat({ assistantType, userId, prompt, responseText, meta = {}, moderation = {} }) {
  try {
    const chatLogModel = prisma.aIChatLog || prisma.aiChatLog || prisma.AIChatLog;
    if (chatLogModel) {
      await chatLogModel.create({
        data: {
          assistantType,
          userId: userId || null,
          prompt: String(prompt || '').slice(0, 5000),
          response: String(responseText || '').slice(0, 10000),
          provider: meta.provider || 'SystemFallback',
          modelName: meta.modelName || 'internal',
          latencyMs: meta.latencyMs || 0,
          status: moderation.isFlagged ? 'MODERATED' : 'SUCCESS',
          isFlagged: Boolean(moderation.isFlagged),
          moderationReason: moderation.reason || null,
          metadata: meta.usage || {}
        }
      });
    }
  } catch (err) {
    console.warn('[AI_CHAT_LOG] Logging to database note:', err.message);
  }
}

// ── 1. Sermon Assistant Endpoints ─────────────────────────────────────────────

router.post('/sermon/draft', async (req, res) => {
  try {
    const { topic, scripture, targetAudience, tone, userId } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic is required' });

    const result = await sermonAssistant.generateDraft({ topic, scripture, targetAudience, tone });
    await logAIChat({
      assistantType: 'SERMON_ASSISTANT',
      userId,
      prompt: `Generate Draft: ${topic} (${scripture})`,
      responseText: result.rawText || JSON.stringify(result.draft),
      meta: result.meta
    });

    return res.json({ success: true, draft: result.draft, meta: result.meta });
  } catch (err) {
    console.error('[AI_SERMON_DRAFT] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sermon/explain-verse', async (req, res) => {
  try {
    const { verseRef, context, userId } = req.body;
    if (!verseRef) return res.status(400).json({ error: 'verseRef is required' });

    const result = await sermonAssistant.explainVerse({ verseRef, context });
    await logAIChat({
      assistantType: 'SERMON_ASSISTANT',
      userId,
      prompt: `Explain Verse: ${verseRef}`,
      responseText: JSON.stringify(result.explanation),
      meta: result.meta
    });

    return res.json({ success: true, explanation: result.explanation, meta: result.meta });
  } catch (err) {
    console.error('[AI_SERMON_VERSE] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/sermon/prayer-points', async (req, res) => {
  try {
    const { topic, passage, userId } = req.body;
    const result = await sermonAssistant.createPrayerPoints({ topic, passage });
    await logAIChat({
      assistantType: 'SERMON_ASSISTANT',
      userId,
      prompt: `Prayer Points: ${topic || passage}`,
      responseText: JSON.stringify(result.data),
      meta: result.meta
    });

    return res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    console.error('[AI_SERMON_PRAYER_POINTS] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 2. Prayer Assistant Endpoints ─────────────────────────────────────────────

router.post('/prayer/categorize', async (req, res) => {
  try {
    const { requestText, userId } = req.body;
    if (!requestText) return res.status(400).json({ error: 'requestText is required' });

    const result = await prayerAssistant.categorizeRequest({ requestText });
    await logAIChat({
      assistantType: 'PRAYER_ASSISTANT',
      userId,
      prompt: requestText,
      responseText: JSON.stringify({ category: result.category, tags: result.secondaryTags }),
      meta: result.meta,
      moderation: result.moderation
    });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[AI_PRAYER_CATEGORIZE] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/prayer/urgency', async (req, res) => {
  try {
    const { requestText, userId } = req.body;
    if (!requestText) return res.status(400).json({ error: 'requestText is required' });

    const result = await prayerAssistant.detectUrgency({ requestText });
    await logAIChat({
      assistantType: 'PRAYER_ASSISTANT',
      userId,
      prompt: requestText,
      responseText: JSON.stringify({ urgencyLevel: result.urgencyLevel, isUrgent: result.isUrgent }),
      meta: result.meta,
      moderation: result.moderation
    });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[AI_PRAYER_URGENCY] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/prayer/summarize', async (req, res) => {
  try {
    const { requestText, authorName, userId } = req.body;
    if (!requestText) return res.status(400).json({ error: 'requestText is required' });

    const result = await prayerAssistant.summarizeForPastors({ requestText, authorName });
    await logAIChat({
      assistantType: 'PRAYER_ASSISTANT',
      userId,
      prompt: requestText,
      responseText: JSON.stringify(result.summaryData),
      meta: result.meta,
      moderation: result.moderation
    });

    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[AI_PRAYER_SUMMARIZE] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 3. Event Content Assistant Endpoints ─────────────────────────────────────

router.post('/event-content/description', async (req, res) => {
  try {
    const { title, date, location, targetAudience, userId } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const result = await eventContentAssistant.generateEventDescription({ title, date, location, targetAudience });
    await logAIChat({
      assistantType: 'EVENT_CONTENT_ASSISTANT',
      userId,
      prompt: `Generate Description for: ${title}`,
      responseText: JSON.stringify(result.data),
      meta: result.meta
    });

    return res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    console.error('[AI_EVENT_DESC] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/event-content/social-captions', async (req, res) => {
  try {
    const { title, description, date, location, userId } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const result = await eventContentAssistant.generateSocialCaptions({ title, description, date, location });
    await logAIChat({
      assistantType: 'EVENT_CONTENT_ASSISTANT',
      userId,
      prompt: `Social Captions for: ${title}`,
      responseText: JSON.stringify(result.captions),
      meta: result.meta
    });

    return res.json({ success: true, captions: result.captions, meta: result.meta });
  } catch (err) {
    console.error('[AI_EVENT_CAPTIONS] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/event-content/blog', async (req, res) => {
  try {
    const { title, description, topic, userId } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const result = await eventContentAssistant.generateEventBlog({ title, description, topic });
    await logAIChat({
      assistantType: 'EVENT_CONTENT_ASSISTANT',
      userId,
      prompt: `Event Blog for: ${title}`,
      responseText: JSON.stringify(result.blog),
      meta: result.meta
    });

    return res.json({ success: true, blog: result.blog, meta: result.meta });
  } catch (err) {
    console.error('[AI_EVENT_BLOG] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 4. Bible Study Assistant Endpoints ───────────────────────────────────────

router.post('/bible-study/explain-verse', async (req, res) => {
  try {
    const { verse, translation, userId } = req.body;
    if (!verse) return res.status(400).json({ error: 'verse is required' });

    const result = await bibleStudyAssistant.explainVerse({ verse, translation });
    await logAIChat({
      assistantType: 'BIBLE_STUDY_ASSISTANT',
      userId,
      prompt: `Explain Verse: ${verse}`,
      responseText: JSON.stringify(result.explanation),
      meta: result.meta
    });

    return res.json({ success: true, explanation: result.explanation, meta: result.meta });
  } catch (err) {
    console.error('[AI_BIBLE_EXPLAIN] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bible-study/devotional', async (req, res) => {
  try {
    const { theme, scripture, userId } = req.body;
    const result = await bibleStudyAssistant.generateDevotional({ theme, scripture });
    await logAIChat({
      assistantType: 'BIBLE_STUDY_ASSISTANT',
      userId,
      prompt: `Devotional Theme: ${theme}`,
      responseText: JSON.stringify(result.devotional),
      meta: result.meta
    });

    return res.json({ success: true, devotional: result.devotional, meta: result.meta });
  } catch (err) {
    console.error('[AI_BIBLE_DEVOTIONAL] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/bible-study/study-notes', async (req, res) => {
  try {
    const { topic, passage, userId } = req.body;
    const result = await bibleStudyAssistant.createStudyNotes({ topic, passage });
    await logAIChat({
      assistantType: 'BIBLE_STUDY_ASSISTANT',
      userId,
      prompt: `Study Notes: ${topic || passage}`,
      responseText: JSON.stringify(result.studyNotes),
      meta: result.meta
    });

    return res.json({ success: true, studyNotes: result.studyNotes, meta: result.meta });
  } catch (err) {
    console.error('[AI_BIBLE_NOTES] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 5. Church Chatbot Endpoint ────────────────────────────────────────────────

router.post('/chatbot/chat', async (req, res) => {
  try {
    const { userQuery, conversationHistory, userId } = req.body;
    if (!userQuery) return res.status(400).json({ error: 'userQuery is required' });

    const result = await churchChatbot.askChatbot({ userQuery, conversationHistory });
    await logAIChat({
      assistantType: 'CHURCH_CHATBOT',
      userId,
      prompt: userQuery,
      responseText: result.answer,
      meta: result.meta,
      moderation: result.moderation
    });

    return res.json({ success: true, answer: result.answer, moderation: result.moderation, meta: result.meta });
  } catch (err) {
    console.error('[AI_CHATBOT] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── 6. Audit & Log Retrieval Endpoint (Admin only) ───────────────────────────

router.get('/logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const assistantType = req.query.assistantType;

    const where = {};
    if (assistantType) where.assistantType = assistantType;

    const chatLogModel = prisma.aIChatLog || prisma.aiChatLog || prisma.AIChatLog;
    if (!chatLogModel) return res.json({ success: true, count: 0, logs: [] });

    const logs = await chatLogModel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('[AI_LOGS] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
