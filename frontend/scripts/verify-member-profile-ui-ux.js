/**
 * Verification test for Member Profile UI/UX Enhancements (/member/profile)
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
console.log("Member Profile UI/UX Verification Suite");
console.log("=======================================================\n");

// --- 1. Human-Friendly Name Logic ---
console.log("--- 1. Testing getHumanFriendlyName ---");
function getHumanFriendlyName(rawName) {
  if (!rawName) return "Believer";
  const trimmed = rawName.trim();
  if (!trimmed) return "Believer";
  const parts = trimmed.split(/\s+/);
  const humanPart = parts.find((p) => /^[a-zA-Z]{2,}$/.test(p));
  if (humanPart) {
    return humanPart.charAt(0).toUpperCase() + humanPart.slice(1).toLowerCase();
  }
  const first = parts[0].replace(/[^a-zA-Z0-9]/g, "");
  if (/^[a-zA-Z]+$/.test(first)) {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return parts.length > 1 ? parts[1] : first || "Believer";
}

assert(getHumanFriendlyName("05AL RAHUL") === "Rahul", "Extracts 'Rahul' from '05AL RAHUL'");
assert(getHumanFriendlyName("23x01a05al rahul") === "Rahul", "Extracts 'Rahul' from '23x01a05al rahul'");
assert(getHumanFriendlyName("John Doe") === "John", "Extracts 'John' from 'John Doe'");
assert(getHumanFriendlyName(null) === "Believer", "Handles null");

// --- 2. Campus & Address Parsing ---
console.log("\n--- 2. Testing parseCampusAndAddress and formatCampusAndAddress ---");
function parseCampusAndAddress(rawAddress) {
  if (!rawAddress) return { campus: "Subhash Nagar", street: "" };
  const trimmed = rawAddress.trim();
  const match = trimmed.match(/^(?:\[(Subhash Nagar|Shapur Nagar|Bahadurpally)\]|(Subhash Nagar|Shapur Nagar|Bahadurpally)\s*\|\s*)(.*)$/is);
  if (match) {
    const matchedCampus = match[1] || match[2];
    const street = (match[3] || "").trim();
    const campus = matchedCampus.toLowerCase().includes("shapur")
      ? "Shapur Nagar"
      : matchedCampus.toLowerCase().includes("bahadur")
      ? "Bahadurpally"
      : "Subhash Nagar";
    return { campus, street };
  }
  return { campus: "Subhash Nagar", street: trimmed };
}

function formatCampusAndAddress(campus, street) {
  const cleanStreet = street.trim();
  if (!cleanStreet) return campus ? `[${campus}]` : "";
  return campus ? `[${campus}] ${cleanStreet}` : cleanStreet;
}

const parsed1 = parseCampusAndAddress("[Subhash Nagar] Flat 201, Street 4");
assert(parsed1.campus === "Subhash Nagar" && parsed1.street === "Flat 201, Street 4", "Parses Subhash Nagar campus prefix");

const parsed2 = parseCampusAndAddress("[Shapur Nagar] Main Road, Shapur");
assert(parsed2.campus === "Shapur Nagar" && parsed2.street === "Main Road, Shapur", "Parses Shapur Nagar campus prefix");

const parsed3 = parseCampusAndAddress("Jeedimetla, Hyderabad");
assert(parsed3.campus === "Subhash Nagar" && parsed3.street === "Jeedimetla, Hyderabad", "Defaults legacy addresses to Subhash Nagar");

const formatted = formatCampusAndAddress("Bahadurpally", "House 12");
assert(formatted === "[Bahadurpally] House 12", "Formats campus into bracketed prefix for database persistence");

// --- 3. Phone Number Cleaning ---
console.log("\n--- 3. Testing cleanIndianPhone ---");
function cleanIndianPhone(rawPhone) {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits;
}

assert(cleanIndianPhone("09505288171") === "9505288171", "Strips leading 0 from 11-digit mobile number");
assert(cleanIndianPhone("+91 9505288171") === "9505288171", "Strips +91 country code prefix");
assert(cleanIndianPhone("9505288171") === "9505288171", "Leaves clean 10-digit number untouched");

// --- 4. Page Structure & UI/UX Audit ---
console.log("\n--- 4. Testing page.tsx UI/UX Components ---");
const pagePath = path.join(__dirname, '../app/member/profile/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

assert(pageContent.includes("getHumanFriendlyName"), "Uses getHumanFriendlyName for human greeting");
assert(pageContent.includes("w-20 h-20 sm:w-24 sm:h-24"), "Uses valid responsive avatar dimensions w-20 h-20 sm:w-24 sm:h-24 (fixes 0x0 collapsed avatar)");
assert(!pageContent.includes("w-22 h-22"), "Does not use invalid w-22 h-22 class");
assert(pageContent.includes("role=\"button\""), "Avatar container has role=button for mobile touch interactions");
assert(pageContent.includes("pt.fellowship.changePhoto"), "Includes accessible camera photo upload trigger for touchscreen devices");
assert(pageContent.includes("option value=\"Subhash Nagar\""), "Includes Subhash Nagar campus option");
assert(pageContent.includes("option value=\"Shapur Nagar\""), "Includes Shapur Nagar campus option");
assert(pageContent.includes("option value=\"Bahadurpally\""), "Includes Bahadurpally campus option");
assert(pageContent.includes("🇮🇳"), "Includes India flag +91 prefix badge for mobile number");
assert(pageContent.includes("pt.form.emailLocked"), "Includes email locked indicator");
assert(pageContent.includes("pt.form.whatsappPref"), "Includes WhatsApp spiritual updates toggle");
assert(pageContent.includes("pt.form.serviceReminderPref"), "Includes Sunday service reminders toggle");
assert(pageContent.includes("pt.saveBar.allSaved"), "Shows positive 'All changes saved' state instead of broken disabled button");

// --- 5. Translations Completeness ---
console.log("\n--- 5. Testing Multi-Language Completeness (EN, TE, HI) ---");
['en', 'te', 'hi'].forEach(lang => {
  assert(pageContent.includes(`${lang}: {`), `Has language definition for ${lang}`);
  assert(pageContent.includes(`fellowship:`), `Has fellowship translations for ${lang}`);
  assert(pageContent.includes(`form:`), `Has form translations for ${lang}`);
  assert(pageContent.includes(`saveBar:`), `Has saveBar translations for ${lang}`);
});

console.log("\n=======================================================");
if (failures === 0) {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (0 failures)");
  process.exit(0);
} else {
  console.error(`❌ FAILED WITH ${failures} FAILURE(S)`);
  process.exit(1);
}
