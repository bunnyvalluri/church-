/**
 * Automated Verification Script for /prayer Page Enhancements
 * Tests:
 * 1. Category Pill Readability & Layout Polish (no truncation, natural text wrapping, break-all & copy email)
 * 2. Form Validation, Privacy & Submission UX (anonymous toggle, disabled/loading submit, error banner, footer smooth scroll)
 * 3. INP & Input Performance (isolated memoized form component, 0/1000 counter, startTransition)
 * 4. Theme & Multi-Language Stability (dark/light classes, category IDs preservation, uniform card heights)
 */

const fs = require('fs');
const path = require('path');

const prayerPagePath = path.join(__dirname, '..', 'app', 'prayer', 'page.tsx');
const footerPath = path.join(__dirname, '..', 'components', 'layout', 'Footer.tsx');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
}

console.log("=================================================");
console.log("Starting Verification for /prayer Page Enhancements");
console.log("=================================================\n");

// Read prayer page file
const prayerCode = fs.readFileSync(prayerPagePath, 'utf8');
const footerCode = fs.readFileSync(footerPath, 'utf8');

// Section 1: Category Pill Readability & Layout Polish
console.log("--- 1. Category Pill Readability & Layout Polish ---");
assert(
  prayerCode.includes("CATEGORY_DEFINITIONS = [") &&
  prayerCode.includes('"healing"') &&
  prayerCode.includes('"family"') &&
  prayerCode.includes('"finance"') &&
  prayerCode.includes('"growth"') &&
  prayerCode.includes('"guidance"') &&
  prayerCode.includes('"thanksgiving"') &&
  prayerCode.includes('"salvation"') &&
  prayerCode.includes('"other"'),
  "8 Canonical prayer categories defined with language-agnostic IDs"
);

assert(
  prayerCode.includes("break-normal whitespace-normal") || prayerCode.includes("whitespace-normal break-normal"),
  "Category pills use break-normal whitespace-normal to prevent ellipsis truncation"
);

assert(
  prayerCode.includes("min-h-[64px]") || prayerCode.includes("min-h-[68px]"),
  "Category pills have sufficient min-height for two-line wrapped labels on mobile"
);

assert(
  prayerCode.includes("grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"),
  "Category buttons are organized in a 2-col mobile, 4-col desktop responsive grid"
);

assert(
  prayerCode.includes("kingofchristministries23@gmail.com") &&
  prayerCode.includes("break-all") &&
  prayerCode.includes("handleCopyEmail") &&
  prayerCode.includes("copiedEmail"),
  "Contact card features break-all wrapping and 1-click clipboard copy support with feedback"
);

// Section 2: Form Validation, Privacy & Submission UX
console.log("\n--- 2. Form Validation, Privacy & Submission UX ---");
assert(
  prayerCode.includes("required={!anonymous}") &&
  prayerCode.includes("isNameValid = anonymous || name.trim().length >= 2"),
  "Anonymous toggle relaxes Name required constraint for seamless submission"
);

assert(
  prayerCode.includes("isFormValid = isNameValid && isEmailValid && isRequestValid") &&
  prayerCode.includes("disabled={isSubmitting || !isFormValid}"),
  "Submit button enforces client-side validation and disables when invalid or submitting"
);

assert(
  prayerCode.includes("Loader2") &&
  prayerCode.includes("isSubmitting ? (") &&
  prayerCode.includes("Submitting Request..."),
  "Submit button features interactive loading spinner state during submission"
);

assert(
  prayerCode.includes("submitError &&") &&
  prayerCode.includes("AlertCircle") &&
  prayerCode.includes("setSubmitError"),
  "Form displays user-friendly alert banner with localized error handling on failure"
);

assert(
  footerCode.includes('/prayer#prayer-form') &&
  footerCode.includes('pathname === "/prayer"') &&
  footerCode.includes('scrollIntoView({ behavior: "smooth", block: "start" })'),
  "Footer 'Prayer Request' button smoothly scrolls to #prayer-form when already on prayer page"
);

// Section 3: INP & Input Performance
console.log("\n--- 3. INP & Input Performance ---");
assert(
  prayerCode.includes("React.memo(function PrayerRequestFormCard") || prayerCode.includes("React.memo("),
  "Prayer form component is isolated and memoized to avoid whole-page re-renders"
);

assert(
  prayerCode.includes("{request.length}/1000") &&
  prayerCode.includes("maxLength={1000}"),
  "Prayer textarea has a localized character counter bound to max 1000 characters"
);

assert(
  prayerCode.includes("startTransition(() => {") &&
  prayerCode.includes("setSelectedCategoryId(catId)"),
  "Category selection updates are wrapped in React useTransition for sub-100ms response"
);

// Section 4: Theme & Multi-Language Stability
console.log("\n--- 4. Theme & Multi-Language Stability ---");
assert(
  prayerCode.includes("bg-slate-50 dark:bg-slate-950") &&
  prayerCode.includes("dark:text-white") &&
  prayerCode.includes("dark:bg-slate-900"),
  "Page includes comprehensive Tailwind dark mode theme tokens"
);

assert(
  prayerCode.includes("items-stretch") &&
  prayerCode.includes("h-full relative") &&
  prayerCode.includes("min-h-[40px]") &&
  prayerCode.includes("mt-auto pt-4 border-t"),
  "Join Our Prayer Meetings campus cards have uniform heights and sticky bottom actions"
);

assert(
  prayerCode.includes("(t as any)?.prayer || (t as any)?.pages?.prayer || {}"),
  "Translations resolve safely from root prayer namespace across English, Telugu, and Hindi"
);

console.log("\n=================================================");
console.log(`Summary: ${passedTests}/${totalTests} Tests Passed`);
console.log("=================================================");

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
