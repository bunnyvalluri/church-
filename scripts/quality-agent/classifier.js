/**
 * scripts/quality-agent/classifier.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Quality Engineering Error Classification & Root-Cause Diagnosis Engine.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ERROR_TAXONOMY = {
  BUILD: 'BUILD',
  TYPE: 'TYPE',
  LINT: 'LINT',
  ROUTING: 'ROUTING',
  SERVER: 'SERVER',
  RUNTIME: 'RUNTIME',
  API: 'API',
  DATABASE: 'DATABASE',
  AUTH: 'AUTH',
  SECURITY: 'SECURITY',
  UI: 'UI',
  A11Y: 'A11Y',
  PERFORMANCE: 'PERFORMANCE',
  SEO: 'SEO',
};

export const SEVERITY_LEVELS = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  INFO: 'INFO',
};

/**
 * Classifies an error log snippet into a structured taxonomy item.
 */
export function classifyDiagnostic(rawLog, context = {}) {
  const log = String(rawLog || '');

  // 1. TypeScript compilation errors
  if (log.includes('TS') && (log.includes('error TS') || /error TS\d+:/.test(log))) {
    const isMissingImport = log.includes('Cannot find module') || log.includes('Cannot find name');
    return {
      type: ERROR_TAXONOMY.TYPE,
      severity: SEVERITY_LEVELS.HIGH,
      category: isMissingImport ? 'MISSING_IMPORT' : 'OBVIOUS_TYPE_ERROR',
      message: log.trim(),
      summary: 'TypeScript typecheck failure',
    };
  }

  // 2. ESLint errors
  if (log.includes('eslint') || log.includes('Error:') && log.includes('rule')) {
    return {
      type: ERROR_TAXONOMY.LINT,
      severity: SEVERITY_LEVELS.MEDIUM,
      category: 'FORMATTING_ISSUE',
      message: log.trim(),
      summary: 'ESLint static code analysis failure',
    };
  }

  // 3. Next.js Build failure
  if (log.includes('Failed to compile') || log.includes('Build error occurred') || log.includes('Next.js build failed')) {
    return {
      type: ERROR_TAXONOMY.BUILD,
      severity: SEVERITY_LEVELS.CRITICAL,
      category: 'BUILD_FAILURE',
      message: log.trim(),
      summary: 'Next.js production bundle compilation error',
    };
  }

  // 4. HTTP 404 / Routing error
  if (log.includes('404') || log.includes('not found') || log.includes('Cannot find route')) {
    return {
      type: ERROR_TAXONOMY.ROUTING,
      severity: SEVERITY_LEVELS.HIGH,
      category: 'BROKEN_INTERNAL_ROUTE',
      message: log.trim(),
      summary: 'Target route returned 404 Not Found',
    };
  }

  // 5. HTTP 500 / Internal Server error
  if (log.includes('500') || log.includes('Internal Server Error')) {
    return {
      type: ERROR_TAXONOMY.SERVER,
      severity: SEVERITY_LEVELS.CRITICAL,
      category: 'SAFE_NULL_HANDLING',
      message: log.trim(),
      summary: 'Server-side 500 render or API exception',
    };
  }

  // 6. Security / Auth
  if (log.includes('unauthorized') || log.includes('CSRF') || log.includes('forbidden') || log.includes('403')) {
    return {
      type: ERROR_TAXONOMY.AUTH,
      severity: SEVERITY_LEVELS.HIGH,
      category: 'AUTHORIZATION_CHANGE',
      message: log.trim(),
      summary: 'Access control or cryptographic verification rejection',
    };
  }

  // 7. Accessibility
  if (log.includes('axe') || log.includes('WCAG') || log.includes('aria') || log.includes('alt')) {
    return {
      type: ERROR_TAXONOMY.A11Y,
      severity: SEVERITY_LEVELS.MEDIUM,
      category: 'SIMPLE_A11Y_ISSUE',
      message: log.trim(),
      summary: 'Accessibility standard compliance issue',
    };
  }

  // 8. Responsive / UI
  if (log.includes('overflow') || log.includes('scrollWidth') || log.includes('viewport')) {
    return {
      type: ERROR_TAXONOMY.UI,
      severity: SEVERITY_LEVELS.MEDIUM,
      category: 'CSS_OVERFLOW',
      message: log.trim(),
      summary: 'Viewport overflow or visual layout defect',
    };
  }

  // Default fallback
  return {
    type: ERROR_TAXONOMY.RUNTIME,
    severity: SEVERITY_LEVELS.MEDIUM,
    category: 'RUNTIME_EXCEPTION',
    message: log.trim(),
    summary: 'Unclassified runtime or test exception',
  };
}
