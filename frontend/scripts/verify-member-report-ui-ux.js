/**
 * Verification Script: Member Problem Report UI/UX Enhancements
 * 
 * Verifies:
 * 1. Mobile dock safe clearance (pb-28 sm:pb-32 lg:pb-12)
 * 2. Back button non-truncation on mobile (eliminated max-w-[50%])
 * 3. 2-column compact category grid on mobile (grid-cols-2 lg:grid-cols-3)
 * 4. Human-readable Indian phone format (+91 95052 88171)
 * 5. Official support email (support@kcmchurch.org)
 * 6. Trilingual localization (EN, TE, HI)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING MEMBER REPORT UI/UX VERIFICATION ---');

const reportPagePath = path.join(__dirname, '..', 'app', 'member', 'report', 'page.tsx');
assert(fs.existsSync(reportPagePath), 'Member report page.tsx must exist');

const source = fs.readFileSync(reportPagePath, 'utf8');

// 1. Mobile Dock Safe Clearance
console.log('Checking #1: Mobile navigation dock clearance padding...');
assert(source.includes('pb-28 sm:pb-32 lg:pb-12'), 'Must have safe clearance for mobile dock (pb-28 sm:pb-32 lg:pb-12)');
console.log('✓ Mobile dock safe clearance verified.');

// 2. Non-Truncating Back Button
console.log('Checking #2: Back button non-truncation...');
assert(!source.includes('max-w-[50%] xs:max-w-none'), 'Must not restrict back button width with max-w-[50%]');
assert(source.includes('whitespace-nowrap">{rt.backToPortal}</span>'), 'Back button label must use whitespace-nowrap to prevent truncation');
console.log('✓ Back button non-truncation verified.');

// 3. 2-Column Compact Category Grid on Mobile
console.log('Checking #3: 2-column compact category grid on mobile...');
assert(source.includes('grid-cols-2 lg:grid-cols-3'), 'Category grid must use grid-cols-2 for compact mobile rendering');
console.log('✓ 2-column compact category grid verified.');

// 4. Readable Indian Phone Format
console.log('Checking #4: Formatted Indian phone number...');
assert(source.includes('+91 95052 88171'), 'Phone number must be formatted with spaces (+91 95052 88171)');
console.log('✓ Formatted Indian phone number verified.');

// 5. Official Support Email
console.log('Checking #5: Official ministry support email...');
assert(source.includes('support@kcmchurch.org'), 'Must use official support email support@kcmchurch.org');
console.log('✓ Official support email verified.');

// 6. Trilingual Localization
console.log('Checking #6: Trilingual localization (EN, TE, HI)...');
assert(source.includes('te: {'), 'Must include Telugu translations');
assert(source.includes('hi: {'), 'Must include Hindi translations');
assert(source.includes('సమస్యను నివేదించండి'), 'Telugu title must exist');
assert(source.includes('समस्या रिपोर्ट करें'), 'Hindi title must exist');
console.log('✓ Trilingual localization verified.');

// 7. Non-Truncating Urgent Support Capsule & Breakpoint Safety
console.log('Checking #7: Non-truncating urgent support capsule...');
assert(!source.includes('<span className="truncate">{rt.urgentSupport} +91 95052 88171</span>'), 'Urgent support phone number must NEVER have truncate');
assert(source.includes('whitespace-nowrap font-bold') && source.includes('+91 95052 88171'), 'Urgent support must be non-truncating and formatted');
assert(source.includes('xl:flex-row xl:items-center'), 'Hero banner must use xl:flex-row to prevent crowding with desktop sidebar');
console.log('✓ Non-truncating urgent support capsule verified.');

// 8. High-Contrast Dark Mode Inputs & Action Buttons
console.log('Checking #8: High-contrast dark mode styling for inputs and buttons...');
assert(!source.includes('dark:bg-slate-850/60'), 'Inputs must not use missing dark:bg-slate-850/60');
assert(source.includes('dark:bg-slate-800/90') && source.includes('dark:placeholder:text-slate-500'), 'Inputs must have dark slate background and high-contrast placeholder');
assert(source.includes('dark:bg-slate-800') && source.includes('dark:text-white'), 'Email support button must be dark slate with white text in dark mode');
console.log('✓ High-contrast dark mode verified.');

console.log('\n======================================================');
console.log('ALL MEMBER REPORT UI/UX VERIFICATION TESTS PASSED! 🚀');
console.log('======================================================');
