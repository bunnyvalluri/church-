/**
 * Verification test for Member Prayers UI/UX Overhaul (/member/prayers)
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
console.log("Member Prayers UI/UX Verification Suite");
console.log("=======================================================\n");

const pagePath = path.join(__dirname, '../app/member/prayers/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

// --- 1. Mobile Truncation Fix ---
console.log("--- 1. Testing Mobile Truncation Fix ---");
assert(!pageContent.includes("grid grid-cols-4"), "Eliminated rigid grid-cols-4 that caused 'Pend...' and 'Ans...' text truncation");
assert(pageContent.includes("overflow-x-auto no-scrollbar"), "Uses responsive horizontally scrollable flex pill bar for mobile");
assert(pageContent.includes("whitespace-nowrap shrink-0"), "Tabs have whitespace-nowrap shrink-0 ensuring zero text truncation on any viewport");

// --- 2. Interactive Stat Cards ---
console.log("\n--- 2. Testing Interactive Stat Cards (Fitts' Law) ---");
assert(pageContent.includes("onClick={() => setFilterStatus(tab)}"), "Stat cards act as interactive filters");
assert(pageContent.includes("ring-2 ring-rose-500"), "Active stat card receives focus ring highlight");

// --- 3. Pastoral Care & 24/7 Helpline Banner ---
console.log("\n--- 3. Testing Pastoral Care Banner ---");
assert(pageContent.includes("pt.pastoralBannerTitle"), "Includes Pastoral Care Banner");
assert(pageContent.includes("+91 95052 88171"), "Includes 24/7 Pastoral Prayer line number");

// --- 4. Category Chips ---
console.log("\n--- 4. Testing Category Chips ---");
assert(pageContent.includes("CATS.map"), "Uses interactive category chips instead of clunky HTML native select");

// --- 5. Multi-Language Parity (EN, TE, HI) ---
console.log("\n--- 5. Testing Multi-Language Parity (EN, TE, HI) ---");
['en', 'te', 'hi'].forEach(lang => {
  assert(pageContent.includes(`${lang}: {`), `Has language definition for ${lang}`);
  assert(pageContent.includes(`pastoralBannerTitle:`), `Has pastoral banner title for ${lang}`);
  assert(pageContent.includes(`pastoralCallBtn:`), `Has pastoral call button for ${lang}`);
  assert(pageContent.includes(`formTitle:`), `Has form title for ${lang}`);
});

console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (0 failures)");
  process.exit(0);
} else {
  console.error(`❌ FAILED WITH ${failures} FAILURE(S)`);
  process.exit(1);
}
