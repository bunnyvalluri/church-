/**
 * scripts/quality-agent/policy.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Quality Engineering Agent Auto-Fix Governance Policy.
 * Defines strict authorization boundaries for autonomous fixes vs manual review.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ALLOWED_AUTO_FIX_CATEGORIES = [
  'MISSING_IMPORT',
  'OBVIOUS_TYPE_ERROR',
  'BROKEN_INTERNAL_ROUTE',
  'INCORRECT_RELATIVE_IMPORT',
  'MISSING_ALT_TEXT',
  'MISSING_TEST_COVERAGE',
  'SIMPLE_A11Y_ISSUE',
  'FORMATTING_ISSUE',
  'BROKEN_METADATA',
  'CSS_OVERFLOW',
  'MISSING_ERROR_BOUNDARY',
  'SAFE_NULL_HANDLING',
];

export const MANUAL_REVIEW_REQUIRED_CATEGORIES = [
  'AUTHENTICATION_CHANGE',
  'AUTHORIZATION_CHANGE',
  'PAYMENT_INTEGRATION',
  'DONATIONS_LEDGER',
  'FINANCIAL_DATABASE',
  'SCHEMA_MIGRATION',
  'SECURITY_SENSITIVE_CODE',
  'SECRETS_AND_KEYS',
  'INFRASTRUCTURE_K8S_DOCKER',
  'PRODUCTION_CONFIG',
  'MAJOR_ARCHITECTURE_REWRITE',
];

export const RESTRICTED_FILE_PATTERNS = [
  /middleware\.ts$/,
  /edgeSession\.ts$/,
  /schema\.prisma$/,
  /\.env.*/,
  /k8s\//,
  /docker\//,
  /stripe/i,
  /razorpay/i,
];

/**
 * Validates whether an issue and target file can be safely modified autonomously.
 */
export function isFixPermitted(category, targetFilePath) {
  // Prohibit auto-fix if category requires human review
  if (MANUAL_REVIEW_REQUIRED_CATEGORIES.includes(category)) {
    return {
      allowed: false,
      reason: `Category '${category}' involves mission-critical or security logic requiring manual engineering review.`,
    };
  }

  // Prohibit auto-fix if file is sensitive
  if (targetFilePath) {
    for (const pattern of RESTRICTED_FILE_PATTERNS) {
      if (pattern.test(targetFilePath)) {
        return {
          allowed: false,
          reason: `Target file '${targetFilePath}' matches restricted pattern (${pattern}). Auto-fix prohibited.`,
        };
      }
    }
  }

  // Ensure category is explicitly allowed
  if (!ALLOWED_AUTO_FIX_CATEGORIES.includes(category)) {
    return {
      allowed: false,
      reason: `Category '${category}' is not in the explicit whitelist for autonomous repair.`,
    };
  }

  return { allowed: true, reason: 'Safe for autonomous quality repair.' };
}
