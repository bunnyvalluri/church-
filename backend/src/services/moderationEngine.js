/**
 * backend/src/services/moderationEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Content Moderation & Crisis Safety Engine for KCM Ministries Platform.
 * Features:
 *   - Prohibited / Harmful language detection
 *   - Suicide & Crisis intervention trigger for Pastoral Care team
 *   - Moderation decision logging
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself',
  'self harm', 'self-harm', 'no reason to live', 'take my life'
];

const INAPPROPRIATE_KEYWORDS = [
  'gambling', 'casino', 'phishing', 'hacked', 'malware', 'exploit'
];

/**
 * Audit and moderate text input or AI generation
 * @param {string} text Input text to evaluate
 * @returns {object} { isFlagged: boolean, reason: string|null, crisisDetected: boolean, riskLevel: string }
 */
function moderateContent(text = '') {
  if (!text || typeof text !== 'string') {
    return { isFlagged: false, reason: null, crisisDetected: false, riskLevel: 'LOW' };
  }

  const lowerText = text.toLowerCase();

  // 1. Check Crisis / Emergency
  for (const keyword of CRISIS_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        isFlagged: true,
        reason: `Crisis / Pastoral Emergency Keyword Detected: "${keyword}"`,
        crisisDetected: true,
        riskLevel: 'CRITICAL',
        helplineInfo: 'National Suicide Prevention Lifeline: 988 (US) / Tele-MANAS: 14416 (India)'
      };
    }
  }

  // 2. Check Inappropriate / Malicious Content
  for (const keyword of INAPPROPRIATE_KEYWORDS) {
    if (lowerText.includes(keyword)) {
      return {
        isFlagged: true,
        reason: `Inappropriate Content Policy Violation: "${keyword}"`,
        crisisDetected: false,
        riskLevel: 'HIGH'
      };
    }
  }

  return {
    isFlagged: false,
    reason: null,
    crisisDetected: false,
    riskLevel: 'SAFE'
  };
}

module.exports = {
  moderateContent,
  CRISIS_KEYWORDS
};
