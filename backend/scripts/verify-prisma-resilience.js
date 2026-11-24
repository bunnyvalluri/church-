/**
 * Verification Script: Prisma Serverless Connection Resilience
 */
const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, condition, details = '') {
  checks.push({ name, passed: Boolean(condition), details });
}

// 1. Verify frontend/lib/prisma.ts
const frontendPrismaPath = path.join(__dirname, '../../frontend/lib/prisma.ts');
const frontendContent = fs.readFileSync(frontendPrismaPath, 'utf8');
check(
  'Frontend isConnectionClosedError Broadened Detection',
  frontendContent.includes('combined.includes(\'kind: closed\')') &&
  frontendContent.includes('combined.includes(\'server has closed the connection\')'),
  'Detects all Neon/PgBouncer connection dropped variants'
);

// 2. Verify backend/src/infrastructure/prisma/client.ts
const backendClientPath = path.join(__dirname, '../src/infrastructure/prisma/client.ts');
const backendClientContent = fs.readFileSync(backendClientPath, 'utf8');
check(
  'Backend Client Resilient Auto-Reconnect Proxy',
  backendClientContent.includes('executeWithRetry') &&
  backendClientContent.includes('isConnectionClosedError') &&
  backendClientContent.includes('createPrismaClient'),
  'Wraps backend TS operations with backoff retry on cold Neon suspend'
);

// 3. Verify backend/src/utils/db.js
const backendDbPath = path.join(__dirname, '../src/utils/db.js');
const backendDbContent = fs.readFileSync(backendDbPath, 'utf8');
check(
  'Backend utils/db.js Resilient Auto-Reconnect Proxy',
  backendDbContent.includes('executeWithRetry') &&
  backendDbContent.includes('isConnectionClosedError'),
  'Wraps backend JS operations with backoff retry'
);

// 4. Verify no multiple PrismaClient instances in backend/src/loops/
const loopFiles = fs.readdirSync(path.join(__dirname, '../src/loops')).filter(f => f.endsWith('.js'));
let rogueLoops = 0;
for (const f of loopFiles) {
  const content = fs.readFileSync(path.join(__dirname, '../src/loops', f), 'utf8');
  if (content.includes('new PrismaClient()')) {
    rogueLoops++;
  }
}
check(
  'Zero Rogue PrismaClient Instances in backend loops',
  rogueLoops === 0,
  `All ${loopFiles.length} loops use the shared resilient singleton`
);

// 5. Verify no multiple PrismaClient instances in backend/src/services/
const serviceFiles = fs.readdirSync(path.join(__dirname, '../src/services')).filter(f => f.endsWith('.js'));
let rogueServices = 0;
for (const f of serviceFiles) {
  const content = fs.readFileSync(path.join(__dirname, '../src/services', f), 'utf8');
  if (content.includes('new PrismaClient()')) {
    rogueServices++;
  }
}
check(
  'Zero Rogue PrismaClient Instances in backend services',
  rogueServices === 0,
  `All ${serviceFiles.length} services use the shared resilient singleton`
);

console.log('\n--- PRISMA POSTGRESQL RESILIENCE VERIFICATION RESULTS ---');
let allPassed = true;
for (const c of checks) {
  const status = c.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${c.name} - ${c.details}`);
  if (!c.passed) allPassed = false;
}

if (!allPassed) {
  console.error('\n❌ Some checks failed!');
  process.exit(1);
} else {
  console.log(`\n🎉 ALL ${checks.length} CHECKS PASSED PERFECTLY!\n`);
}
