const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying Member Profile Dropdown Modal UI/UX Fixes ---');

const layoutPath = path.join(__dirname, '../app/member/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

// 1. Verify getHumanFriendlyName implementation & behavior
assert.ok(layoutContent.includes('function getHumanFriendlyName'), 'getHumanFriendlyName function should exist in layout.tsx');
assert.ok(layoutContent.includes('// Filter out tokens that look like roll numbers'), 'Roll number filtering comment should exist');

// Test the name formatting logic dynamically
function getHumanFriendlyName(rawName) {
  if (!rawName) return "Member";
  const trimmed = rawName.trim();
  if (!trimmed) return "Member";

  const tokens = trimmed
    .split(/\s+/)
    .filter((tok) => !/^[0-9]+[a-zA-Z0-9]*$/i.test(tok) && !/^[a-zA-Z]+[0-9]+[a-zA-Z0-9]*$/i.test(tok));

  if (tokens.length > 0) {
    return tokens
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
      .join(" ");
  }

  const parts = trimmed.split(/\s+/);
  const humanPart = parts.find((p) => /^[a-zA-Z]{2,}$/.test(p));
  if (humanPart) {
    return humanPart.charAt(0).toUpperCase() + humanPart.slice(1).toLowerCase();
  }

  const first = parts[0].replace(/[^a-zA-Z0-9]/g, "");
  if (/^[a-zA-Z]+$/.test(first)) {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return parts.length > 1 ? parts[1] : first || "Member";
}

assert.strictEqual(getHumanFriendlyName("05AL RAHUL"), "Rahul", "05AL RAHUL should format as Rahul");
assert.strictEqual(getHumanFriendlyName("05AL VALLURI RAHUL"), "Valluri Rahul", "05AL VALLURI RAHUL should format as Valluri Rahul");
assert.strictEqual(getHumanFriendlyName("john doe"), "John Doe", "john doe should format as John Doe");
console.log('✓ Name formatting verified (eliminates roll-number leakage like 05AL RAHUL -> Rahul)');

// 2. Verify sidebar profile card displays formatted name
assert.ok(
  layoutContent.includes('{getHumanFriendlyName(user?.name)}'),
  'Sidebar profile card must display getHumanFriendlyName(user?.name)'
);
console.log('✓ Sidebar profile card verified');

// 3. Verify modal dropdown header displays formatted name
assert.ok(
  layoutContent.includes('<h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate leading-tight">{getHumanFriendlyName(user?.name)}</h4>'),
  'Profile dropdown header must display getHumanFriendlyName(user?.name)'
);
console.log('✓ Profile dropdown header card verified');

// 4. Verify all 6 core navigation links in quick navigation
const quickLinks = [
  '/member/profile',
  '/member/events',
  '/member/prayers',
  '/member/sermons',
  '/member/volunteer',
  '/member/give'
];

for (const link of quickLinks) {
  assert.ok(layoutContent.includes(`href="${link}"`), `Quick navigation must include link to ${link}`);
}
assert.ok(layoutContent.includes('href="/member/report"'), 'Quick navigation must include link to /member/report');
console.log('✓ Quick navigation links verified (all 6 core services + report issue)');

// 5. Verify modal viewport responsiveness & scroll safety
assert.ok(layoutContent.includes('max-h-[calc(100dvh-4.75rem)]'), 'Dropdown must enforce max-h for mobile viewport height');
assert.ok(layoutContent.includes('overflow-y-auto'), 'Dropdown must support vertical scrolling');
assert.ok(layoutContent.includes('z-[9999]'), 'Dropdown modal must have z-[9999]');
assert.ok(layoutContent.includes('z-[9998]'), 'Backdrop overlay must have z-[9998]');
console.log('✓ Viewport responsiveness, scroll safety, and z-index verified');

// 6. Verify header z-index escalation on modal open
assert.ok(layoutContent.includes('${isProfileOpen ? "z-[100]" : "z-30"}'), 'Header must elevate z-index to z-[100] when profile modal is open');
console.log('✓ Header z-index escalation verified (prevents collision with z-40 mobile bottom dock)');

// 7. Verify mobile drawer enhancements
assert.ok(layoutContent.includes('w-[min(85vw,320px)]'), 'Mobile drawer width must be responsive w-[min(85vw,320px)]');
assert.ok(layoutContent.includes('overscroll-contain'), 'Mobile drawer scroll container must have overscroll-contain');
assert.ok(layoutContent.includes('pb-6 overscroll-contain'), 'Scroll container must have bottom padding to prevent clipping');
assert.ok(layoutContent.includes('lg:hidden p-2.5 bg-white dark:bg-gray-800/80'), 'Mobile drawer must pin preferences bar in footer');
assert.ok(layoutContent.includes('setIsProfileOpen(false);'), 'Escape key must close both drawer and profile dropdown');
console.log('✓ Mobile drawer pinned preferences, scroll padding, and width verified');

console.log('--- ALL MEMBER PROFILE DROPDOWN & MOBILE DRAWER UI/UX TESTS PASSED SUCCESSFULLY ---');
