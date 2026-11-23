/**
 * verify-locations-enhancements.js
 * Verification test suite for /locations page enhancements:
 * 1. Mobile Footer Single Instance & Layout Structure
 * 2. Hero Branch Pill Width (No Truncation) & Equal Card Heights
 * 3. INP Transitions, Interactive Branch Details Modal & External Links
 * 4. Route-Aware Breadcrumbs & Multi-Language Support
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting /locations Enhancements Verification Suite...\n');

const locationsPath = path.join(__dirname, '../app/about/locations/page.tsx');
assert.ok(fs.existsSync(locationsPath), 'Locations page file must exist');

const content = fs.readFileSync(locationsPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

// 1. Mobile Footer Single Instance & Layout Structure
test('Footer is imported and rendered as a single canonical instance', () => {
  const footerImports = (content.match(/import Footer from/g) || []).length;
  assert.strictEqual(footerImports, 1, 'Footer must be imported exactly once');

  const footerTags = (content.match(/<Footer\s*\/>/g) || []).length;
  assert.strictEqual(footerTags, 1, 'Footer must be rendered exactly once');

  assert.ok(content.includes('id="locations-page-wrapper"'), 'Outer wrapper must have explicit ID');
  assert.ok(content.includes('flex flex-col justify-between'), 'Outer wrapper must use flex layout');
});

// 2. Hero Pill Width & Equal Card Heights
test('Hero branch quick-jump buttons have expanded container without text truncation', () => {
  assert.ok(
    content.includes('max-w-4xl') || content.includes('max-w-5xl'),
    'Hero container must have expanded max-width (max-w-4xl or max-w-5xl)'
  );
  assert.ok(
    !content.includes('<span className="truncate font-black">{b.name}</span>'),
    'Hero branch buttons must not truncate branch names with truncate'
  );
  assert.ok(
    content.includes('whitespace-normal sm:whitespace-nowrap'),
    'Hero branch buttons must allow clean wrapping on mobile and non-truncating nowrap on desktop'
  );
});

test('Branch cards have h-full flex flex-col justify-between and aligned bottom buttons', () => {
  assert.ok(
    content.includes('h-full') && content.includes('flex flex-col justify-between'),
    'Branch cards must use h-full flex flex-col justify-between'
  );
  assert.ok(
    content.includes('flex-1 flex flex-col justify-start'),
    'Service schedule container must use flex-1 flex flex-col justify-start to absorb height differences'
  );
  assert.ok(
    content.includes('mt-auto') && content.includes('grid grid-cols-1 sm:grid-cols-2 gap-2.5'),
    'Actions container must use mt-auto to anchor buttons evenly at card bottom'
  );
});

// 3. INP & Interactive Performance
test('Smooth scrolling and modal triggers use React useTransition', () => {
  assert.ok(content.includes('useTransition'), 'useTransition must be imported');
  assert.ok(content.includes('startTransition'), 'startTransition must be used');
  assert.ok(
    content.includes('handleScrollToBranch'),
    'Smooth scrolling must have dedicated handler'
  );
  assert.ok(
    content.includes('handleOpenBranchModal'),
    'Modal opening must have dedicated transition handler'
  );
});

test('Interactive Branch Details Modal is accessible with ARIA dialog and Escape key handler', () => {
  assert.ok(content.includes('role="dialog"'), 'Modal must have role="dialog"');
  assert.ok(content.includes('aria-modal="true"'), 'Modal must have aria-modal="true"');
  assert.ok(content.includes('aria-labelledby="branch-modal-title"'), 'Modal must have aria-labelledby');
  assert.ok(content.includes('e.key === "Escape"'), 'Escape key must close modal');
  assert.ok(content.includes('handleCopyAddress'), 'Modal must include address copying feature');
});

test('External links for Google Maps and YouTube have target="_blank" and rel="noopener noreferrer"', () => {
  assert.ok(
    content.includes('target="_blank"') && content.includes('rel="noopener noreferrer"'),
    'External links must have target="_blank" and rel="noopener noreferrer"'
  );
  assert.ok(
    content.includes('https://youtube.com/@kcmchurchshapur7107'),
    'YouTube link must point to official channel'
  );
});

// 4. Breadcrumb, Theme & Multi-Language Stability
test('Breadcrumb dynamically adapts to /locations route', () => {
  assert.ok(content.includes('usePathname'), 'usePathname must be imported from next/navigation');
  assert.ok(
    content.includes('isDirectLocationsRoute'),
    'isDirectLocationsRoute flag must be present'
  );
  assert.ok(
    content.includes('!isDirectLocationsRoute'),
    'About crumb must only be rendered when on /about/locations'
  );
});

test('Multi-language strings exist for Telugu and Hindi across all branches and sections', () => {
  assert.ok(content.includes('isTelugu') && content.includes('isHindi'), 'Language flags must exist');
  assert.ok(content.includes('షాపూర్ నగర్ బ్రాంచ్'), 'Telugu branch name must exist');
  assert.ok(content.includes('శాపుర నగర్ शाखा') || content.includes('शापुर नगर शाखा'), 'Hindi branch name must exist');
  assert.ok(content.includes('సుభాష్ నగర్ బ్రాంచ్'), 'Telugu Subhash Nagar must exist');
  assert.ok(content.includes('బహదూర్‌పల్లి నగర్ బ్రాంచ్'), 'Telugu Bahadurpally must exist');
});

console.log(`\n📊 Verification Summary: ${passedTests}/${totalTests} tests passed.\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
