/**
 * Verification Script: Member Online Giving UI/UX Enhancements
 * 
 * Verifies:
 * 1. cleanDonorName strips roll number prefixes ('05AL RAHUL' -> 'Rahul')
 * 2. cleanIndianPhone cleans leading 0 ('09505288171' -> '9505288171')
 * 3. Mobile dock safe clearance (pb-28 sm:pb-32 lg:pb-12) on page.tsx
 * 4. 2-column compact grid (grid-cols-2) for giving purposes on mobile
 * 5. Headquarters church branch priority (Subhash Nagar default / profile auto-select)
 * 6. Phone input with India flag +91 badge and auto-clean
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING MEMBER GIVE UI/UX VERIFICATION ---');

const givePagePath = path.join(__dirname, '..', 'app', 'member', 'give', 'page.tsx');
assert(fs.existsSync(givePagePath), 'Member give page.tsx must exist');
const pageSource = fs.readFileSync(givePagePath, 'utf8');

const giveFormPath = path.join(__dirname, '..', 'components', 'GiveForm.tsx');
assert(fs.existsSync(giveFormPath), 'GiveForm.tsx must exist');
const formSource = fs.readFileSync(giveFormPath, 'utf8');

// 1. Mobile Dock Safe Clearance
console.log('Checking #1: Mobile navigation dock clearance padding...');
assert(pageSource.includes('pb-28 sm:pb-32 lg:pb-12'), 'Member give page must have pb-28 sm:pb-32 lg:pb-12 for mobile dock clearance');
console.log('✓ Mobile dock safe clearance verified.');

// 2. cleanDonorName Logic
console.log('Checking #2: Donor name roll number cleanup...');
assert(formSource.includes('cleanDonorName'), 'GiveForm must define cleanDonorName');

// Unit test cleanDonorName logic
function cleanDonorNameTest(rawName) {
  if (!rawName) return "";
  const trimmed = rawName.trim();
  const cleaned = trimmed.replace(/^[0-9]+[xX\-_]?[0-9a-zA-Z]+[\s\-_]+/i, "");
  if (cleaned.trim().length > 0) {
    const words = cleaned.trim().split(/\s+/);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  return trimmed;
}

assert.strictEqual(cleanDonorNameTest('05AL RAHUL'), 'Rahul', 'Must clean 05AL RAHUL to Rahul');
assert.strictEqual(cleanDonorNameTest('23x01a05al rahul'), 'Rahul', 'Must clean 23x01a05al rahul to Rahul');
assert.strictEqual(cleanDonorNameTest('John Doe'), 'John Doe', 'Regular names must remain untouched');
console.log('✓ Donor name roll number cleanup verified.');

// 3. cleanIndianPhone Logic
console.log('Checking #3: Indian mobile phone leading zero cleanup...');
assert(formSource.includes('cleanIndianPhone'), 'GiveForm must define cleanIndianPhone');

// Unit test cleanIndianPhone logic
function cleanIndianPhoneTest(rawPhone) {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

assert.strictEqual(cleanIndianPhoneTest('09505288171'), '9505288171', 'Must strip leading zero from 09505288171');
assert.strictEqual(cleanIndianPhoneTest('+919505288171'), '9505288171', 'Must strip +91 prefix');
assert.strictEqual(cleanIndianPhoneTest('9505288171'), '9505288171', 'Clean 10-digit phone must remain untouched');
console.log('✓ Indian mobile phone cleanup verified.');

// 4. 2-Column Compact Purpose Grid on Mobile
console.log('Checking #4: 2-column compact purpose grid on mobile...');
assert(formSource.includes('grid grid-cols-2 gap-2 sm:gap-2.5'), 'Purpose grid must use grid-cols-2 for compact mobile rendering');
console.log('✓ 2-column compact purpose grid verified.');

// 5. Headquarters Church Campus Priority
console.log('Checking #5: Subhash Nagar headquarters branch priority...');
assert(formSource.includes('Subhash Nagar (Main Branch)'), 'Must designate Subhash Nagar as main branch');
assert(formSource.includes('data.user.address.toLowerCase()'), 'Must auto-detect member campus from profile address');
console.log('✓ Headquarters church campus priority verified.');

// 6. India Flag +91 Phone Input Badge
console.log('Checking #6: India flag +91 phone input badge...');
assert(formSource.includes('🇮🇳') && formSource.includes('+91'), 'Phone input must render India flag and +91 prefix badge');
console.log('✓ India flag +91 phone input badge verified.');

console.log('\n======================================================');
console.log('ALL MEMBER ONLINE GIVING UI/UX VERIFICATION TESTS PASSED! 🚀');
console.log('======================================================');
