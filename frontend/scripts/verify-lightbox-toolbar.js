/**
 * Verification Script: Lightbox Modal Toolbar Senior UI/UX Fixes
 */
const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, condition, details = '') {
  checks.push({ name, passed: Boolean(condition), details });
}

const galleryPath = path.join(__dirname, '../app/gallery/page.tsx');
const galleryContent = fs.readFileSync(galleryPath, 'utf8');

// 1. Mobile top-bar collision prevention
check(
  'Category badge hidden on mobile top-bar (<640px)',
  galleryContent.includes('hidden sm:flex items-center gap-2 min-w-0'),
  'Prevents category badge from crowding into action buttons on narrow mobile viewports'
);

// 2. Play button compact squircle geometry on mobile
check(
  'Play button compact geometry without horizontal ballooning',
  galleryContent.includes('p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold') &&
  galleryContent.includes('<span className="hidden lg:inline">{gt.playSlideshow}</span>'),
  'Ensures Play button matches squircle icon buttons on mobile/tablet without pushing against left elements'
);

// 3. Mobile floating category & title caption capsule
check(
  'Mobile floating caption pill in photo viewport',
  galleryContent.includes('sm:hidden absolute top-2.5 left-1/2 -translate-x-1/2') &&
  galleryContent.includes('currentLightboxLocalized?.category'),
  'Provides clean, non-intrusive photo metadata display directly on mobile'
);

// 4. Action button gap and close button separation
check(
  'Action group balanced spacing and close button margin',
  galleryContent.includes('flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0') &&
  galleryContent.includes('ml-0.5 sm:ml-2 shadow-md active:scale-95'),
  'Guarantees comfortable tap spacing and accidental-tap prevention for Close button'
);

console.log('\n--- GALLERY LIGHTBOX TOOLBAR VERIFICATION RESULTS ---');
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
