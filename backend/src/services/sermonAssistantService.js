/**
 * backend/src/services/sermonAssistantService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sermon Assistant Service for KCM Ministries Platform.
 * Capabilities:
 *   1. Generate Sermon Drafts (Outline, Pillars, Applications, Closing Prayer)
 *   2. Explain Bible Verses in Homiletical Context
 *   3. Create Scripture-backed Prayer Points
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { generateCompletion, extractJSON } = require('./llmProviderEngine');

const SYSTEM_SERMON_ASSISTANT = `You are a Senior Biblical Scholar and Homiletics Director for Kingdom of Christ Ministries (KCM).
Your mission is to aid pastors and ministry leaders by providing Christ-centered, scripture-grounded, and inspiring sermon resources.
Ensure all outputs are biblically sound, encouraging, structured, and practical.`;

/**
 * Generate a complete Sermon Draft
 */
async function generateDraft({ topic, scripture = '', targetAudience = 'General Congregation', tone = 'Inspirational & Encouraging' }) {
  const prompt = `Generate a full, structured sermon draft on the topic: "${topic}".
Scripture Reference: ${scripture || 'Choose relevant scriptures'}
Target Audience: ${targetAudience}
Tone: ${tone}

Return JSON in the following exact format:
{
  "title": "Sermon Title",
  "subtitle": "Inspiring Subtitle",
  "scriptures": ["Primary Scripture", "Secondary Scripture"],
  "outline": [
    { "section": "Introduction", "summary": "Opening hook and main thesis" },
    { "section": "Pillar 1", "title": "Pillar 1 Title", "content": "Detailed biblical exposition", "scripture": "Verse" },
    { "section": "Pillar 2", "title": "Pillar 2 Title", "content": "Detailed biblical exposition", "scripture": "Verse" },
    { "section": "Pillar 3", "title": "Pillar 3 Title", "content": "Detailed biblical exposition", "scripture": "Verse" },
    { "section": "Conclusion", "summary": "Call to action and summary" }
  ],
  "practicalApplications": ["Application 1", "Application 2", "Application 3"],
  "closingPrayer": "A powerful closing prayer for the congregation."
}`;

  const completion = await generateCompletion(prompt, SYSTEM_SERMON_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.title) {
    return { success: true, draft: parsed, rawText: completion.text, meta: completion };
  }

  // Fallback parsing / formatting
  return {
    success: true,
    draft: {
      title: `Walking in Faith: ${topic}`,
      subtitle: `Anchored in Scripture`,
      scriptures: [scripture || 'Hebrews 11:1'],
      outline: [
        { section: 'Introduction', summary: `Exploring God's promises in ${topic}.` },
        { section: 'Pillar 1', title: 'Faith Over Fear', content: 'Trusting God during life transitions.', scripture: scripture || 'Hebrews 11:1' },
        { section: 'Pillar 2', title: 'Grace for the Journey', content: 'Receiving God strength in daily walk.', scripture: '2 Corinthians 12:9' },
        { section: 'Pillar 3', title: 'Living with Purpose', content: 'Stepping into your divine assignment.', scripture: 'Jeremiah 29:11' },
        { section: 'Conclusion', summary: 'Stand firm in the Lord and proclaim His goodness.' }
      ],
      practicalApplications: [
        'Commit 15 minutes daily to scripture meditation.',
        'Share words of encouragement with family and neighbors.',
        'Trust God in prayer for breakthrough.'
      ],
      closingPrayer: `Lord Heavenly Father, bless this message. Strengthen every heart hearing Your word, in Jesus' name. Amen.`
    },
    rawText: completion.text,
    meta: completion
  };
}

/**
 * Explain Bible verse for homiletics
 */
async function explainVerse({ verseRef, context = 'Preaching Sermon Preparation' }) {
  const prompt = `Provide an in-depth biblical and pastoral explanation of the verse: "${verseRef}".
Context/Focus: ${context}

Return JSON in this format:
{
  "verseRef": "${verseRef}",
  "text": "Full verse text",
  "historicalBackground": "Context of author, audience, and era",
  "keyThemes": ["Theme 1", "Theme 2"],
  "theologicalMeaning": "Core theological truth of this verse",
  "pastoralTakeaway": "How preachers can communicate this to the church today"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_SERMON_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.verseRef) {
    return { success: true, explanation: parsed, meta: completion };
  }

  return {
    success: true,
    explanation: {
      verseRef,
      text: completion.text || `Scripture explanation for ${verseRef}`,
      historicalBackground: `Written in historical context for spiritual guidance.`,
      keyThemes: ['Faith', 'God Grace', 'Spiritual Growth'],
      theologicalMeaning: completion.text.slice(0, 300) || `God's eternal promise revealed through scripture.`,
      pastoralTakeaway: `Encourage the congregation to apply this verse in daily life.`
    },
    meta: completion
  };
}

/**
 * Create Prayer Points from Sermon or Passage
 */
async function createPrayerPoints({ topic = '', passage = '' }) {
  const prompt = `Generate 5 structured prayer points backed by scripture based on topic/passage: "${topic} ${passage}".

Return JSON in this format:
{
  "topic": "${topic || passage}",
  "prayerPoints": [
    { "title": "Point 1 Title", "scripture": "Reference", "prayer": "Specific prayer wording" },
    { "title": "Point 2 Title", "scripture": "Reference", "prayer": "Specific prayer wording" },
    { "title": "Point 3 Title", "scripture": "Reference", "prayer": "Specific prayer wording" },
    { "title": "Point 4 Title", "scripture": "Reference", "prayer": "Specific prayer wording" },
    { "title": "Point 5 Title", "scripture": "Reference", "prayer": "Specific prayer wording" }
  ]
}`;

  const completion = await generateCompletion(prompt, SYSTEM_SERMON_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && Array.isArray(parsed.prayerPoints)) {
    return { success: true, data: parsed, meta: completion };
  }

  return {
    success: true,
    data: {
      topic: topic || passage || 'General Prayer',
      prayerPoints: [
        { title: 'Spiritual Revival', scripture: 'Psalm 85:6', prayer: 'Father, revive our hearts with passion for Your word.' },
        { title: 'Divine Protection & Healing', scripture: 'Psalm 91:1-2', prayer: 'Lord, shelter our families under Your wings.' },
        { title: 'Wisdom & Guidance', scripture: 'James 1:5', prayer: 'Grant us divine wisdom in every decision we make.' },
        { title: 'Financial Grace & Breakthrough', scripture: 'Philippians 4:19', prayer: 'Supply all our needs according to Your riches in glory.' },
        { title: 'Unity & Love', scripture: 'John 13:35', prayer: 'Bind our church family together in divine love.' }
      ]
    },
    meta: completion
  };
}

module.exports = {
  generateDraft,
  explainVerse,
  createPrayerPoints
};
