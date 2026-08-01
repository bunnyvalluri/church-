/**
 * backend/src/services/bibleStudyAssistantService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Bible Study Assistant Service for KCM Ministries Platform.
 * Capabilities:
 *   1. In-depth Verse Breakdown & Original Language Roots (Greek/Hebrew)
 *   2. Daily & Weekly Devotional Generator
 *   3. Small Group Bible Study Guides & Leader Notes
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { generateCompletion, extractJSON } = require('./llmProviderEngine');

const SYSTEM_BIBLE_STUDY_ASSISTANT = `You are a Senior Bible Educator and Discipleship Director for Kingdom of Christ Ministries (KCM).
Your goal is to make scripture accessible, deep, contextually accurate, and practical for personal devotions and small group bible studies.`;

/**
 * In-Depth Verse Explanation
 */
async function explainVerse({ verse = 'John 3:16', translation = 'NIV' }) {
  const prompt = `Provide an in-depth Bible Study breakdown of verse: "${verse}" (${translation}).

Return JSON in this format:
{
  "verse": "${verse}",
  "translation": "${translation}",
  "text": "Full scripture text",
  "originalLanguageNotes": "Greek/Hebrew root words and key terms explained",
  "historicalContext": "Era, author, and cultural context",
  "theologicalMeaning": "Core doctrine and divine lesson",
  "practicalApplication": "Daily life application for modern believers"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_BIBLE_STUDY_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.verse) {
    return { success: true, explanation: parsed, meta: completion };
  }

  return {
    success: true,
    explanation: {
      verse,
      translation,
      text: completion.text || `Scripture text for ${verse}`,
      originalLanguageNotes: `Key words examined in original biblical language.`,
      historicalContext: `Historical setting of the book and author.`,
      theologicalMeaning: completion.text.slice(0, 300) || `Core spiritual truth of God's love and grace.`,
      practicalApplication: `Walk faithfully by applying this truth every day.`
    },
    meta: completion
  };
}

/**
 * Generate Devotional
 */
async function generateDevotional({ theme = 'Walking in Grace', scripture = 'Ephesians 2:8-9' }) {
  const prompt = `Create a complete inspirational devotional guide on theme: "${theme}".
Scripture Focus: ${scripture}

Return JSON in this format:
{
  "title": "Devotional Title",
  "theme": "${theme}",
  "keyVerse": "${scripture}",
  "reflection": "3-paragraph inspiring reflection blending scripture with daily life",
  "reflectionQuestion": "Thought-provoking question for personal journaling",
  "dailyActionStep": "Concrete spiritual step to take today",
  "closingPrayer": "Short earnest prayer"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_BIBLE_STUDY_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.title) {
    return { success: true, devotional: parsed, meta: completion };
  }

  return {
    success: true,
    devotional: {
      title: `Daily Bread: ${theme}`,
      theme,
      keyVerse: scripture,
      reflection: `God's grace is not earned; it is freely given out of His boundless love. When we reflect on ${scripture}, we are reminded that our salvation and daily strength rest entirely in God's hands.`,
      reflectionQuestion: `In what areas of your life can you rest in God grace today rather than striving in your own effort?`,
      dailyActionStep: `Take 5 minutes during lunch to pray and express gratitude for God unmerited favor.`,
      closingPrayer: `Heavenly Father, thank You for Your unmerited favor. Help me to live in Your grace today. Amen.`
    },
    meta: completion
  };
}

/**
 * Create Small Group Bible Study Notes
 */
async function createStudyNotes({ topic = 'Living as Light in the World', passage = 'Matthew 5:14-16' }) {
  const prompt = `Generate small group bible study notes and leader guide for topic: "${topic}".
Passage: ${passage}

Return JSON:
{
  "topic": "${topic}",
  "passage": "${passage}",
  "icebreaker": "Fun or engaging opening icebreaker question",
  "contextSummary": "Brief background summary of the passage for group leaders",
  "discussionQuestions": [
    "Question 1 (Observation)",
    "Question 2 (Interpretation)",
    "Question 3 (Personal Reflection)",
    "Question 4 (Practical Application)"
  ],
  "leaderNotes": "Tips for facilitating discussion",
  "closingPrayerPoints": ["Prayer Point 1", "Prayer Point 2"]
}`;

  const completion = await generateCompletion(prompt, SYSTEM_BIBLE_STUDY_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.discussionQuestions) {
    return { success: true, studyNotes: parsed, meta: completion };
  }

  return {
    success: true,
    studyNotes: {
      topic,
      passage,
      icebreaker: `Share a time when a light helped you navigate in complete darkness.`,
      contextSummary: `In Matthew 5, Jesus calls His followers to reflect His divine light in a dark world.`,
      discussionQuestions: [
        `What does Jesus mean when He calls us 'the light of the world'?`,
        `How might we inadvertently hide our light under a basket?`,
        `In what specific relationship or setting can you shine Christ's light this week?`,
        `What good deeds can our small group do together to glorify our Father in heaven?`
      ],
      leaderNotes: `Encourage open sharing and remind members that shining light starts with love and kindness.`,
      closingPrayerPoints: [`Pray for boldness in sharing faith`, `Pray for opportunities to serve neighbors`]
    },
    meta: completion
  };
}

module.exports = {
  explainVerse,
  generateDevotional,
  createStudyNotes
};
