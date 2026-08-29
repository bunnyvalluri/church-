#!/usr/bin/env node

/**
 * i18n Translation Audit Tool — Kingdom of Christ Ministries
 *
 * Recursively validates key parity, completeness, and non-empty values
 * across English (canonical), Telugu, and Hindi dictionaries.
 */

const { en } = require('../i18n/locales/en.ts');
const { te } = require('../i18n/locales/te.ts');
const { hi } = require('../i18n/locales/hi.ts');

console.log('====================================================');
console.log('   🔍 KCM PORTAL — MULTILINGUAL TRANSLATION AUDIT   ');
console.log('====================================================\n');

function auditTree(sourceNode, targetNode, langName, path = []) {
  const missing = [];
  const extra = [];

  if (!sourceNode || typeof sourceNode !== 'object') return { missing, extra };
  if (!targetNode || typeof targetNode !== 'object') {
    missing.push(path.join('.'));
    return { missing, extra };
  }

  for (const [key, sourceVal] of Object.entries(sourceNode)) {
    const currentPath = [...path, key];
    const pathString = currentPath.join('.');

    if (!(key in targetNode)) {
      missing.push(pathString);
      continue;
    }

    const targetVal = targetNode[key];

    if (sourceVal && typeof sourceVal === 'object' && !Array.isArray(sourceVal)) {
      const childAudit = auditTree(sourceVal, targetVal, langName, currentPath);
      missing.push(...childAudit.missing);
      extra.push(...childAudit.extra);
    } else {
      if (targetVal === undefined || targetVal === null || targetVal === '') {
        missing.push(pathString);
      }
    }
  }

  // Check for extra keys
  for (const key of Object.keys(targetNode)) {
    if (!(key in sourceNode)) {
      extra.push([...path, key].join('.'));
    }
  }

  return { missing, extra };
}

function countLeaves(node) {
  if (!node || typeof node !== 'object') return 1;
  let count = 0;
  for (const val of Object.values(node)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      count += countLeaves(val);
    } else {
      count += 1;
    }
  }
  return count;
}

const totalKeys = countLeaves(en);
const totalTeKeys = countLeaves(te);
const totalHiKeys = countLeaves(hi);

console.log(`📊 Statistics:`);
console.log(`   - English (Canonical) Keys: ${totalKeys}`);
console.log(`   - Telugu Keys:               ${totalTeKeys}`);
console.log(`   - Hindi Keys:                ${totalHiKeys}\n`);

let errors = 0;

// Audit Telugu against English
const teAudit = auditTree(en, te, 'Telugu');
if (teAudit.missing.length > 0) {
  console.error(`❌ [Telugu] Missing ${teAudit.missing.length} translations:`);
  teAudit.missing.slice(0, 20).forEach((k) => console.error(`   - ${k}`));
  if (teAudit.missing.length > 20) console.error(`   ... and ${teAudit.missing.length - 20} more`);
  errors += teAudit.missing.length;
} else {
  console.log(`✅ [Telugu] 100% key parity with English (${totalKeys}/${totalKeys})`);
}

// Audit Hindi against English
const hiAudit = auditTree(en, hi, 'Hindi');
if (hiAudit.missing.length > 0) {
  console.error(`❌ [Hindi] Missing ${hiAudit.missing.length} translations:`);
  hiAudit.missing.slice(0, 20).forEach((k) => console.error(`   - ${k}`));
  if (hiAudit.missing.length > 20) console.error(`   ... and ${hiAudit.missing.length - 20} more`);
  errors += hiAudit.missing.length;
} else {
  console.log(`✅ [Hindi] 100% key parity with English (${totalKeys}/${totalKeys})`);
}

if (teAudit.extra.length > 0) {
  console.warn(`⚠️ [Telugu] ${teAudit.extra.length} extra/orphaned keys found.`);
}
if (hiAudit.extra.length > 0) {
  console.warn(`⚠️ [Hindi] ${hiAudit.extra.length} extra/orphaned keys found.`);
}

console.log('\n====================================================');
if (errors === 0) {
  console.log('🎉 AUDIT PASSED: All translation dictionaries are in perfect sync!');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error(`💥 AUDIT FAILED: ${errors} missing translation key(s) detected.`);
  console.log('====================================================\n');
  process.exit(1);
}
