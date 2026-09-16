/**
 * scripts/scan_production_bundle.js
 * Scans all compiled client-side JavaScript bundles in frontend/.next/static/
 * to verify zero secret leaks in the production build.
 */
const fs = require('fs');
const path = require('path');

const CHUNKS_DIR = path.join(__dirname, '..', 'frontend', '.next', 'static');

const PATTERNS = [
  { name: 'Private Key', regex: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi },
  { name: 'PostgreSQL Connection URI', regex: /postgres(ql)?:\/\/[^\s"'<>]+/gi },
  { name: 'MongoDB Connection URI', regex: /mongodb(\+srv)?:\/\/[^\s"'<>]+/gi },
  { name: 'Google OAuth Client Secret', regex: /GOCSPX-[a-zA-Z0-9_-]+/g },
  { name: 'Razorpay Secret Key', regex: /ECg9gW5JJMK4bu6ojCocM7TW/g },
  { name: 'Cloudinary Secret', regex: /TVEa1MEMTnYAfEv5xPnfcqm3MDg/g },
  { name: 'Resend Secret Key', regex: /re_[a-zA-Z0-9]{20,}/g },
  { name: 'OpenAI Secret Key', regex: /sk-[a-zA-Z0-9]{20,}/g },
  { name: 'Anthropic Secret Key', regex: /sk-ant-[a-zA-Z0-9]{20,}/g },
  { name: 'OpenRouter Secret Key', regex: /sk-or-v1-[a-zA-Z0-9]{20,}/g },
  { name: 'Firecrawl Secret Key', regex: /fc-[a-zA-Z0-9]{20,}/g },
  { name: 'Stripe Secret Key', regex: /sk_(test|live)_[a-zA-Z0-9]{20,}/g },
  { name: 'Twilio Auth Token', regex: /2a80e28eef958ee493956ee37bb9671c/g },
  { name: 'Hardcoded Password Assignment', regex: /password\s*[:=]\s*["'][^"'\s]{6,}["']/gi }
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

console.log('====================================================');
console.log('  KCM CHURCH — PRODUCTION CLIENT BUNDLE SECRET SCAN');
console.log('====================================================\n');

if (!fs.existsSync(CHUNKS_DIR)) {
  console.error(`Error: Chunks directory does not exist at ${CHUNKS_DIR}. Run build first.`);
  process.exit(1);
}

const jsFiles = getAllFiles(CHUNKS_DIR);
console.log(`Found ${jsFiles.length} client JavaScript bundle files.\n`);

let totalViolations = 0;
const findings = [];

jsFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relPath = path.relative(path.join(__dirname, '..'), filePath);

  PATTERNS.forEach(({ name, regex }) => {
    regex.lastIndex = 0;
    const matches = content.match(regex);
    if (matches) {
      // Filter false positives like documentation strings, UI translation labels, or field names
      matches.forEach((m) => {
        // Exclude dummy schema field definitions / input types
        const normalizedMatch = m.toLowerCase().replace(/\s/g, '');
        if (normalizedMatch.includes('password:"password"') || normalizedMatch.includes("password:'password'")) return;
        // Exclude UI translation labels for "Password" field
        if (m.includes('password:"Password"') || m.includes('password:"पासवर्ड"') || m.includes('password:"పాస్‌వర్డ్"')) return;
        // Exclude Firebase Auth error code enum constants
        if (m.includes('wrong-password') || m.includes('missing-password') || m.includes('weak-password')) return;
        // Exclude sanitize/redact placeholder templates
        if (m.includes('[REDACTED_') || m.includes('[REDACTED]')) return;

        totalViolations++;
        findings.push({
          file: relPath,
          pattern: name,
          match: m.substring(0, 40) + '...'
        });
      });
    }
  });
});

if (totalViolations === 0) {
  console.log('✓ PASS: Zero secret exposures found across all production client bundles.');
  console.log('✓ No private keys, database URLs, OAuth secrets, or server API tokens are present in client JS.');
} else {
  console.error(`✗ FAIL: Found ${totalViolations} secret exposures in client bundles:`);
  console.table(findings);
  process.exit(1);
}
console.log('\n====================================================\n');
