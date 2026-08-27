#!/usr/bin/env node
/**
 * scripts/quality-agent/index.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Quality Engineering System CLI Entrypoint.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { runQualityAudit } from './engine.js';

const args = process.argv.slice(2);
const isAutoHeal = args.includes('--auto-heal');
const isAuditOnly = args.includes('--audit-only') || !isAutoHeal;

runQualityAudit({ autoHeal: isAutoHeal, auditOnly: isAuditOnly })
  .then((report) => {
    if (report.failed > 0 && report.fixed === 0) {
      console.log(`Quality audit completed with ${report.failed} issue(s). Check reports/ for details.`);
      process.exit(1);
    } else {
      console.log(`Quality audit completed successfully.`);
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error(`Quality agent execution error:`, err);
    process.exit(1);
  });
