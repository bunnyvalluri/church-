#!/usr/bin/env node
/**
 * scripts/pre-commit-secret-scan.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-commit / CI zero-trust secret detection scanner for KCM Portal.
 * Scans staged files (or all tracked files if run in standalone mode)
 * and halts execution if live secrets or sensitive patterns are detected.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SECRET_PATTERNS = [
  { name: 'Google API Key (Live)', regex: /\bAIza[0-9A-Za-z-_]{35}\b/g },
  { name: 'Stripe Live Secret Key', regex: /\bsk_live_[0-9a-zA-Z]{24,}\b/g },
  { name: 'Stripe Webhook Secret (Raw)', regex: /\bwhsec_[0-9a-zA-Z]{24,}\b/g },
  { name: 'Razorpay Live Secret Key', regex: /\brzp_live_[0-9a-zA-Z]{14,}\b/g },
  { name: 'Neon PostgreSQL Token', regex: /\bnpg_[0-9a-zA-Z]{10,}\b/g },
  { name: 'Resend API Key', regex: /\bre_[0-9a-zA-Z_]{20,}\b/g },
  { name: 'GitHub Personal Access Token', regex: /\bgh[pousr]_[0-9a-zA-Z]{36}\b/g },
  { name: 'Unredacted Database Password URI', regex: /postgres(?:ql)?:\/\/(?!postgres:postgres|dummy:dummy|<DB_USER>|username:password|user:pass)[a-zA-Z0-9_-]+:[^@\s]+@[a-zA-Z0-9.-]+/g }
];

const IGNORE_PATTERNS = [
  /\.env\.example$/,
  /\.gitleaks\.toml$/,
  /\.keyfinderignore\.json$/,
  /docs\/SECRET_AUDIT\.md$/,
  /docs\/SECRET_REMEDIATION\.md$/,
  /docs\/SECRET_REMEDIATION_REPORT\.md$/,
  /\.(png|jpg|jpeg|gif|ico|webp|woff|woff2|ttf|eot|pdf|bin|node|dll)$/
];

function runScan() {
  console.log('🔒 [KCM SECURITY] Running Zero-Trust Secret Scan...\n');
  
  let filesToScan = [];
  try {
    // Check staged files first
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    if (staged.length > 0) {
      console.log(`Scanning ${staged.length} staged file(s)...`);
      filesToScan = staged;
    } else {
      console.log('No staged files. Scanning all tracked repository files...');
      filesToScan = execSync('git ls-files', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean);
    }
  } catch (e) {
    console.error('Error fetching git file list:', e.message);
    process.exit(1);
  }

  let violations = 0;

  for (const file of filesToScan) {
    if (!fs.existsSync(file)) continue;
    if (IGNORE_PATTERNS.some(p => p.test(file))) continue;

    try {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, lineNum) => {
        // Skip comment lines in specific allowlisted context if needed
        for (const pattern of SECRET_PATTERNS) {
          pattern.regex.lastIndex = 0;
          const match = line.match(pattern.regex);
          if (match) {
            // Check if it is a template placeholder
            if (line.includes('<YOUR_') || line.includes('<REDACTED_') || line.includes('${SECRET_') || line.includes('placeholder')) {
              continue;
            }
            console.error(`❌ [LEAK DETECTED] ${pattern.name} found in ${file}:${lineNum + 1}`);
            console.error(`   Preview: ${line.trim().replace(pattern.regex, '***REDACTED***')}`);
            violations++;
          }
        }
      });
    } catch (e) {
      // Ignore binary read errors
    }
  }

  if (violations > 0) {
    console.error(`\n🚨 [FAILED] Found ${violations} potential secret exposure(s). Commit/Push aborted!`);
    console.error('Please move credentials to environment variables or secret managers before committing.');
    process.exit(1);
  } else {
    console.log('✅ [PASSED] Zero exposed secrets detected across all scanned files.\n');
  }
}

runScan();
