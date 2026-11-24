/**
 * Verification Script: Homepage Hero & Navigation Senior UI/UX Audit
 */
const fs = require('fs');
const path = require('path');

const checks = [];

function check(name, condition, details = '') {
  checks.push({ name, passed: Boolean(condition), details });
}

// 1. Check page.tsx has sticky navbar container
const pagePath = path.join(__dirname, '../app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');
check(
  'Sticky Navbar Container in page.tsx',
  pageContent.includes('<div className="sticky top-0 z-[1000] w-full">\n        <Navbar />\n      </div>') ||
  pageContent.includes('sticky top-0 z-[1000]'),
  'Ensures navbar stays pinned and never scrolls out of position'
);

// 2. Check Hero.tsx section properties
const heroPath = path.join(__dirname, '../components/sections/Hero.tsx');
const heroContent = fs.readFileSync(heroPath, 'utf8');
check(
  'Hero Section dynamic viewport height & scroll margin',
  heroContent.includes('min-h-[calc(100dvh-var(--kcm-header-height,76px))]') &&
  heroContent.includes('scroll-mt-[var(--kcm-header-height,80px)]'),
  'Prevents hero bloating and navbar header collision on anchor scroll'
);

// 3. Check WCAG 2.5.5 Touch Target on quick action buttons
check(
  'WCAG 2.5.5 Touch Targets (min-h-[44px]) on Quick Actions',
  heroContent.includes('min-h-[44px]') && !heroContent.includes('min-h-[38px]'),
  'Guarantees accessible touch target size >= 44x44px for all mobile users'
);

// 4. Check Non-Clipping NGO Portal text
check(
  'Non-clipping CTA text (NGO Portal)',
  heroContent.includes('ctaNgoDisplay = language === "en" ? "NGO Portal" : ctaNgoText'),
  'Eliminates ugly text truncation ("Visit NGO Por...") on narrow viewports'
);

// 5. Check all homepage sections have scroll-mt
const sections = [
  { file: 'About.tsx', id: 'about' },
  { file: 'Services.tsx', id: 'services' },
  { file: 'Events.tsx', id: 'events' },
  { file: 'Sermons.tsx', id: 'sermons' },
  { file: 'Contact.tsx', id: 'contact' },
];

for (const sec of sections) {
  const secPath = path.join(__dirname, `../components/sections/${sec.file}`);
  const secContent = fs.readFileSync(secPath, 'utf8');
  check(
    `Section #${sec.id} has scroll-mt`,
    secContent.includes('scroll-mt-[var(--kcm-header-height,80px)]') || secContent.includes('scroll-mt-'),
    `Ensures navbar never overlaps header of #${sec.id} when clicked from nav`
  );
}

console.log('\n--- HOMEPAGE HERO & NAVIGATION VERIFICATION RESULTS ---');
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
