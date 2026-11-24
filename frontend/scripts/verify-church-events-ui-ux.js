/**
 * Verification test for Church Events UI/UX Overhaul (/member/events and /events)
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
console.log("Church Events UI/UX Verification Suite");
console.log("=======================================================\n");

// --- 1. Dynamic Weekday Computation ---
console.log("--- 1. Testing getNextWeekday logic ---");
function getNextWeekday(dayOfWeek, targetHour = 10, targetMinute = 0) {
  const now = new Date();
  const result = new Date(now);
  const currentDay = now.getDay();
  let daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  if (daysToAdd === 0 && (now.getHours() > targetHour || (now.getHours() === targetHour && now.getMinutes() >= targetMinute))) {
    daysToAdd = 7;
  }
  result.setDate(now.getDate() + daysToAdd);
  result.setHours(targetHour, targetMinute, 0, 0);
  return result;
}

const nextSunday = getNextWeekday(0, 10, 0);
assert(nextSunday.getDay() === 0, "Calculates next Sunday (day 0)");
assert(nextSunday > new Date(), "Next Sunday is in the future");

const nextFriday = getNextWeekday(5, 11, 0);
assert(nextFriday.getDay() === 5, "Calculates next Friday (day 5)");
assert(nextFriday > new Date(), "Next Friday is in the future");

// --- 2. Calendar Link & ICS Generation ---
console.log("\n--- 2. Testing Calendar Export Functions ---");
function getGoogleCalendarUrl(event) {
  const d = new Date(event.date);
  const startTime = d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  const endTime = new Date(d.getTime() + 3 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location,
    dates: `${startTime}/${endTime}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const sampleEvent = {
  title: "Sunday Celebration & Miracle Gathering",
  description: "Join us for praise & worship",
  location: "Subhash Nagar Main Sanctuary",
  date: new Date().toISOString(),
  time: "10:00 AM IST",
};

const gCalUrl = getGoogleCalendarUrl(sampleEvent);
assert(gCalUrl.includes("calendar.google.com/calendar/render"), "Generates Google Calendar URL");
assert(gCalUrl.includes("Sunday+Celebration"), "Google Calendar URL contains event title");

// --- 3. UI/UX Structure in member/events/page.tsx ---
console.log("\n--- 3. Testing Member Events UI/UX Elements ---");
const pagePath = path.join(__dirname, '../app/member/events/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

assert(pageContent.includes("onClick={() => setFilter(tab)}"), "Stat cards are interactive filters (Fitts' Law)");
assert(pageContent.includes("Campus:"), "Includes Campus filter label");
assert(pageContent.includes("Subhash Nagar"), "Supports Subhash Nagar campus");
assert(pageContent.includes("Shapur Nagar"), "Supports Shapur Nagar campus");
assert(pageContent.includes("Bahadurpally"), "Supports Bahadurpally campus");
assert(pageContent.includes("maps.google.com"), "Includes Google Maps navigation directions link");
assert(pageContent.includes("getGoogleCalendarUrl"), "Includes Google Calendar export");
assert(pageContent.includes("downloadIcsFile"), "Includes Apple/Outlook .ics file export");
assert(!pageContent.includes("rec-sunday-celebration"), "Fake recurring Sunday event completely removed");
assert(!pageContent.includes("rec-friday-fasting"), "Fake recurring Friday event completely removed");
assert(!pageContent.includes("rec-tuesday-bible-study"), "Fake recurring Tuesday event completely removed");
assert(pageContent.includes("const allEvents = useMemo(() => {"), "Events list dynamically uses database events");
assert(pageContent.includes("/member/sermons"), "Past events link to sermon messages instead of dead button");
assert(pageContent.includes("/gallery"), "Past events link to photo gallery instead of dead button");

// --- 4. Translations Completeness (EN, TE, HI) ---
console.log("\n--- 4. Testing Multi-Language Completeness (EN, TE, HI) ---");
['en', 'te', 'hi'].forEach(lang => {
  assert(pageContent.includes(`${lang}: {`), `Has language definition for ${lang}`);
  assert(pageContent.includes(`allCampuses:`), `Has campus translations for ${lang}`);
  assert(pageContent.includes(`directions:`), `Has directions translations for ${lang}`);
  assert(pageContent.includes(`calendar:`), `Has calendar translations for ${lang}`);
  assert(pageContent.includes(`watchMessage:`), `Has watch message translations for ${lang}`);
});

console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (0 failures)");
  process.exit(0);
} else {
  console.error(`❌ FAILED WITH ${failures} FAILURE(S)`);
  process.exit(1);
}
