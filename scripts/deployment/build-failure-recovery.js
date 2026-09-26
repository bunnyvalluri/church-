#!/usr/bin/env node

/**
 * scripts/deployment/build-failure-recovery.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Build Failure Auto-Recovery & Diagnostic Intelligence Engine.
 *
 * Capabilities:
 *  1. Autonomous build failure triage and categorization.
 *  2. Distinguishes transient infrastructure errors from deterministic code bugs.
 *  3. Safe self-healing for transient tasks (e.g. missing Prisma client, network retry).
 *  4. Strict zero-bypass policy: Never suppresses deterministic type or lint errors.
 *  5. Outputs structured diagnostic artifacts for operators and incident response.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.resolve(process.cwd(), 'reports');

/**
 * Classify build error log into structured diagnostic category
 */
function classifyBuildError(errorLog) {
  const log = String(errorLog || '');

  if (log.includes('@prisma/client did not initialize') || log.includes('PrismaClientInitializationError') || log.includes('prisma generate')) {
    return {
      category: 'PRISMA_CLIENT_GENERATION_MISSING',
      isTransient: true,
      recoveryCommand: 'npm run postinstall',
      description: 'Prisma client was not generated prior to Next.js compilation step.',
      recommendation: 'Ensure `npx prisma generate` executes in postinstall or pre-build step.',
    };
  }

  if (log.includes('ETIMEDOUT') || log.includes('ECONNRESET') || log.includes('fetch failed') || log.includes('getaddrinfo ENOTFOUND')) {
    return {
      category: 'TRANSIENT_NETWORK_TIMEOUT',
      isTransient: true,
      recoveryCommand: 'RETRY_WITH_BACKOFF',
      description: 'Transient network failure connecting to package registry or external API.',
      recommendation: 'Retry build operation with exponential backoff.',
    };
  }

  if (log.includes('Type error:') || log.includes('TS') || log.includes('tsc --noEmit')) {
    return {
      category: 'TYPESCRIPT_TYPE_MISMATCH',
      isTransient: false,
      recoveryCommand: null,
      description: 'Deterministic TypeScript compilation error detected.',
      recommendation: 'Fix type definitions or prop mismatches. Do NOT bypass with ignoreBuildErrors.',
    };
  }

  if (log.includes('ESLint:') || log.includes('next lint')) {
    return {
      category: 'ESLINT_RULE_VIOLATION',
      isTransient: false,
      recoveryCommand: null,
      description: 'Deterministic ESLint static analysis error detected.',
      recommendation: 'Resolve lint rule violation in source code.',
    };
  }

  if (log.includes('MULTILINGUAL TRANSLATION AUDIT') || log.includes('key parity')) {
    return {
      category: 'I18N_DICTIONARY_DESYNC',
      isTransient: false,
      recoveryCommand: null,
      description: 'Translation dictionaries (EN/TE/HI) have mismatched keys.',
      recommendation: 'Synchronize missing keys in frontend/i18n/locales/*.ts.',
    };
  }

  return {
    category: 'UNKNOWN_BUILD_FAILURE',
    isTransient: false,
    recoveryCommand: null,
    description: 'Unclassified build failure.',
    recommendation: 'Review complete build log artifact in reports/ directory.',
  };
}

/**
 * Execute Build with Autonomous Diagnosis & Transient Recovery
 */
function executeBuildWithAutoRecovery(maxRetries = 2) {
  console.log(`\n======================================================`);
  console.log(`🛠️ KCM BUILD FAILURE AUTO-RECOVERY ENGINE`);
  console.log(`======================================================\n`);

  let attempt = 1;
  let lastError = null;

  while (attempt <= maxRetries) {
    console.log(`[Attempt ${attempt}/${maxRetries}] Executing production build command...`);
    try {
      execSync('npm run build -w frontend', {
        stdio: 'inherit',
        env: {
          ...process.env,
          SKIP_ENV_VALIDATION: '1',
          DB_OFFLINE: 'true',
        },
      });
      console.log(`\n✅ Build completed successfully on attempt ${attempt}.`);
      return { success: true, attempts: attempt };
    } catch (err) {
      lastError = err;
      const errorOutput = err.stdout?.toString() || err.stderr?.toString() || err.message;
      const diagnostic = classifyBuildError(errorOutput);

      console.warn(`\n⚠️ Build failed on attempt ${attempt}. Classification: ${diagnostic.category}`);
      console.warn(`  Description: ${diagnostic.description}`);

      if (diagnostic.isTransient && diagnostic.recoveryCommand && attempt < maxRetries) {
        console.log(`🔄 Attempting safe self-healing action: ${diagnostic.recoveryCommand}`);
        if (diagnostic.recoveryCommand !== 'RETRY_WITH_BACKOFF') {
          try {
            execSync(diagnostic.recoveryCommand, { stdio: 'inherit' });
          } catch (healErr) {
            console.warn(`Self-healing action failed: ${healErr.message}`);
          }
        }
        attempt++;
        continue;
      }

      // Deterministic error or retries exhausted
      writeFailureReport({
        status: 'BUILD_FAILED',
        attempts: attempt,
        diagnostic,
        timestamp: new Date().toISOString(),
      });

      console.error(`\n❌ Deterministic build failure. Pipeline halted per safety policy.`);
      process.exit(1);
    }
  }

  process.exit(1);
}

function writeFailureReport(reportData) {
  try {
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    const reportPath = path.join(REPORT_DIR, 'build-failure-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
    console.log(`📄 Diagnostic report saved to: ${reportPath}`);
  } catch (err) {
    console.warn(`Could not save failure report:`, err.message);
  }
}

if (require.main === module) {
  executeBuildWithAutoRecovery();
}

module.exports = { classifyBuildError, executeBuildWithAutoRecovery };
