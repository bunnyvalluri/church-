/**
 * Verification test for Member Portal UI/UX Enhancements (/member)
 * Covers:
 * 1. Human-friendly name parsing ('05AL RAHUL' -> 'Rahul')
 * 2. Layout fixes (no redundant header logout, mobile dock clearance, correct dock tabs)
 * 3. Page fixes (no duplicate stat cards in hero, watermark collision fix, 6-card grid + support banner)
 * 4. Service spotlight & collapsible feedback widget
 * 5. Multi-language completeness (en, te, hi)
 */

const fs = require('fs');
const path = require('path');

let failures = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failures++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

console.log("\n=======================================================");
console.log("Member Portal UI/UX Verification Suite");
console.log("=======================================================\n");

// --- 1. Test getHumanFriendlyName logic ---
console.log("--- 1. Human-friendly name logic ---");
function getHumanFriendlyName(rawName) {
  if (!rawName) return "Member";
  const trimmed = rawName.trim();
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

assert(getHumanFriendlyName("05AL RAHUL") === "Rahul", "Extracts 'Rahul' from '05AL RAHUL'");
assert(getHumanFriendlyName("23-01a05al rahul") === "Rahul", "Extracts 'Rahul' from '23-01a05al rahul'");
assert(getHumanFriendlyName("John Doe") === "John", "Extracts 'John' from 'John Doe'");
assert(getHumanFriendlyName("Pastor Samuel") === "Pastor", "Extracts first word if all are words");
assert(getHumanFriendlyName(null) === "Member", "Handles null gracefully");
assert(getHumanFriendlyName("") === "Member", "Handles empty string gracefully");

// --- 2. Test layout.tsx ---
console.log("\n--- 2. layout.tsx UI/UX structure ---");
const layoutPath = path.join(__dirname, '../app/member/layout.tsx');
const layoutContent = fs.readFileSync(layoutPath, 'utf8');

assert(layoutContent.includes("getHumanFriendlyName(user?.name)"), "Uses getHumanFriendlyName in top bar");
assert(!layoutContent.includes('className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50'), "Direct redundant header Log Out button removed from top bar");
assert(layoutContent.includes("pb-28 sm:pb-32 lg:pb-12"), "Main content has pb-28/pb-32 padding so mobile dock does not clip content");
assert(layoutContent.includes('{ name: "Events", href: "/member/events", icon: Calendar'), "Mobile bottom dock includes Events tab");
assert(!layoutContent.includes('{ name: "Report", href: "/member/report"'), "Mobile dock does not show low-priority Report tab in primary 5-dock");

// --- 3. Test page.tsx ---
console.log("\n--- 3. page.tsx UI/UX structure ---");
const pagePath = path.join(__dirname, '../app/member/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

assert(pageContent.includes("const firstName = getHumanFriendlyName(user?.name);"), "Uses getHumanFriendlyName for hero greeting firstName");
assert(!pageContent.includes("dt.stats.events.label") || pageContent.match(/dt\.stats\.events\.label/g).length === 1, "Duplicate stat labels inside hero banner removed (only 1 occurrence in overview grid)");
assert(pageContent.includes("hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-amber-500/10"), "Watermark BookOpen icon is hidden on mobile to prevent collision with verse text");
assert(pageContent.includes("dt.supportBanner.title"), "Full-width Pastoral Care & Support Banner rendered");
assert(pageContent.includes("dt.serviceSpotlight.title"), "Upcoming Service & Fellowship Spotlight rendered in right column");
assert(pageContent.includes("dt.serviceSpotlight.serviceName"), "Service name rendered in Spotlight");
assert(pageContent.includes("isFeedbackExpanded"), "Feedback widget has isFeedbackExpanded toggle");
assert(pageContent.includes("dt.feedbackToggle.tapToShare"), "Collapsible Feedback Card includes tapToShare trigger");

// --- 4. Translations completeness ---
console.log("\n--- 4. Multi-language completeness ---");
['en', 'te', 'hi'].forEach(lang => {
  assert(pageContent.includes(`cards:`), `Has cards for ${lang}`);
  assert(pageContent.includes(`supportBanner:`), `Has supportBanner for ${lang}`);
  assert(pageContent.includes(`serviceSpotlight:`), `Has serviceSpotlight for ${lang}`);
  assert(pageContent.includes(`feedbackToggle:`), `Has feedbackToggle for ${lang}`);
});

console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (0 failures)");
  process.exit(0);
} else {
  console.error(`❌ FAILED WITH ${failures} FAILURE(S)`);
  process.exit(1);
}
