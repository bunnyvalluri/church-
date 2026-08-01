/**
 * backend/src/services/prayerAssistantService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Prayer Assistant Service for KCM Ministries Platform.
 * Capabilities:
 *   1. Categorize Prayer Requests (HEALTH, FAMILY, FINANCIAL, SPIRITUAL, GUIDANCE, THANKSGIVING, URGENT_INTERCESSION)
 *   2. Urgency Detection & Crisis Safeguard Scoring
 *   3. Pastoral Summarization & Care Guidance
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { generateCompletion, extractJSON } = require('./llmProviderEngine');
const { moderateContent } = require('./moderationEngine');

const SYSTEM_PRAYER_ASSISTANT = `You are a Pastoral Care Assistant for Kingdom of Christ Ministries (KCM).
Your responsibility is to analyze prayer requests with extreme empathy, discernment, and confidentiality.
Always evaluate urgency, categorize accurately, and format pastoral insights for ministry care teams.`;

/**
 * Categorize prayer request
 */
async function categorizeRequest({ requestText }) {
  // First run content safety check
  const moderation = moderateContent(requestText);

  const prompt = `Analyze this church prayer request and determine its primary category and secondary tags.
Request: "${requestText}"

Valid Categories:
- HEALTH (Sickness, Surgery, Medical Recovery)
- FAMILY (Marriage, Children, Household)
- FINANCIAL (Job Search, Debt, Provision)
- SPIRITUAL (Salvation, Faith, Deliverance)
- GUIDANCE (Career, Move, Ministry Decision)
- THANKSGIVING (Answered Prayer, Praise)
- OTHER (General Intercession)

Return JSON in this format:
{
  "category": "HEALTH",
  "confidenceScore": 0.95,
  "secondaryTags": ["Healing", "Surgery"],
  "summary": "Brief 1-sentence summary"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_PRAYER_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  let category = 'OTHER';
  let secondaryTags = [];
  let summary = requestText.slice(0, 100);

  if (parsed && parsed.category) {
    category = parsed.category.toUpperCase();
    secondaryTags = parsed.secondaryTags || [];
    summary = parsed.summary || summary;
  }

  return {
    success: true,
    category,
    secondaryTags,
    summary,
    moderation,
    meta: completion
  };
}

/**
 * Detect urgency level and crisis flags
 */
async function detectUrgency({ requestText }) {
  const moderation = moderateContent(requestText);

  if (moderation.crisisDetected) {
    return {
      success: true,
      urgencyLevel: 'CRISIS',
      isUrgent: true,
      requiresImmediatePastoralContact: true,
      reason: moderation.reason,
      helplineInfo: moderation.helplineInfo,
      suggestedAction: 'Notify Senior Pastor immediately & activate crisis intercession team.',
      moderation
    };
  }

  const prompt = `Evaluate the urgency level of this prayer request: "${requestText}".

Urgency Levels:
- LOW (General requests, routine prayers)
- NORMAL (Standard prayer needs)
- HIGH (Upcoming surgery, serious illness, job crisis)
- URGENT (ICU admission, sudden loss, immediate intervention required)

Return JSON:
{
  "urgencyLevel": "HIGH",
  "isUrgent": true,
  "reason": "Clear explanation of urgency level",
  "suggestedPastoralAction": "Recommended follow-up step"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_PRAYER_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.urgencyLevel) {
    return {
      success: true,
      urgencyLevel: parsed.urgencyLevel.toUpperCase(),
      isUrgent: ['HIGH', 'URGENT', 'CRISIS'].includes(parsed.urgencyLevel.toUpperCase()),
      reason: parsed.reason,
      suggestedAction: parsed.suggestedPastoralAction,
      moderation,
      meta: completion
    };
  }

  return {
    success: true,
    urgencyLevel: 'NORMAL',
    isUrgent: false,
    reason: 'Standard prayer request',
    suggestedAction: 'Include in weekly prayer list',
    moderation,
    meta: completion
  };
}

/**
 * Summarize prayer request for pastors
 */
async function summarizeForPastors({ requestText, authorName = 'Church Member' }) {
  const moderation = moderateContent(requestText);

  const prompt = `Create an executive pastoral summary for Pastor/Intercession Team for prayer request from "${authorName}".
Request text: "${requestText}"

Return JSON:
{
  "member": "${authorName}",
  "keyNeed": "Core prayer request subject",
  "pastoralSummary": "2-sentence executive summary for pastor's briefing note",
  "recommendedScripture": "Scripture passage for pastoral encouragement call",
  "followUpStrategy": "Phone Call / Home Visit / Prayer Team Assignment"
}`;

  const completion = await generateCompletion(prompt, SYSTEM_PRAYER_ASSISTANT, { jsonMode: true });
  const parsed = extractJSON(completion.text);

  if (parsed && parsed.pastoralSummary) {
    return {
      success: true,
      summaryData: parsed,
      moderation,
      meta: completion
    };
  }

  return {
    success: true,
    summaryData: {
      member: authorName,
      keyNeed: 'General Prayer Request',
      pastoralSummary: `Prayer request from ${authorName}: ${requestText.slice(0, 150)}...`,
      recommendedScripture: 'Philippians 4:6-7',
      followUpStrategy: 'Include in intercession list and reach out via encouragement message.'
    },
    moderation,
    meta: completion
  };
}

module.exports = {
  categorizeRequest,
  detectUrgency,
  summarizeForPastors
};
