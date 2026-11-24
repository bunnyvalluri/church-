/**
 * Verification Script: Member Volunteer UI/UX Enhancements
 * 
 * Verifies:
 * 1. Mobile dock clearance (pb-28 sm:pb-32 lg:pb-12) preventing cards from being cut in half
 * 2. Responsive 2-column mobile grid (grid-cols-2 lg:grid-cols-3)
 * 3. Interactive top filter tabs (ALL, URGENT, MY_APPS)
 * 4. Church Branch / Campus selection (Subhash Nagar, Shapur Nagar, Bahadurpally)
 * 5. Service Availability selection (Sunday, Friday, Midweek, Outreach, Youth)
 * 6. Contact & WhatsApp mode options (WhatsApp, Call, Email)
 * 7. Department-specific quick skills & spiritual gifts tags
 * 8. Application status tracking & local persistence in My Applications
 * 9. Pastoral Volunteer Care & Helpline (+91 95052 88171)
 * 10. Trilingual parity (English, Telugu, Hindi)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING MEMBER VOLUNTEER UI/UX VERIFICATION ---');

const volunteerPagePath = path.join(__dirname, '..', 'app', 'member', 'volunteer', 'page.tsx');
assert(fs.existsSync(volunteerPagePath), 'Member volunteer page.tsx must exist');

const source = fs.readFileSync(volunteerPagePath, 'utf8');

// 1. Mobile Dock Clearance
console.log('Checking #1: Mobile navigation dock clearance padding...');
assert(source.includes('pb-28 sm:pb-32 lg:pb-12'), 'Must have safe clearance for mobile dock (pb-28 sm:pb-32 lg:pb-12)');
console.log('✓ Mobile dock safe clearance verified.');

// 2. Responsive 2-Col Mobile Grid
console.log('Checking #2: Responsive 2-column mobile grid...');
assert(source.includes('grid-cols-2 lg:grid-cols-3'), 'Must use 2-column compact grid on mobile to eliminate endless scrolling');
console.log('✓ Responsive 2-col mobile grid verified.');

// 3. Interactive Navigation & Filter Tabs
console.log('Checking #3: Interactive top navigation tabs...');
assert(source.includes('activeTab'), 'Must support activeTab switching');
assert(source.includes('tabAll'), 'Must have All Departments tab');
assert(source.includes('tabUrgent'), 'Must have Urgent / High Need tab');
assert(source.includes('tabMyApps'), 'Must have My Applications tab');
console.log('✓ Interactive navigation tabs verified.');

// 4. Church Branch / Campus Selector
console.log('Checking #4: Multi-campus branch selection...');
assert(source.includes('campusSubhash'), 'Must support Subhash Nagar campus');
assert(source.includes('campusShapur'), 'Must support Shapur Nagar branch');
assert(source.includes('campusBahadurpally'), 'Must support Bahadurpally branch');
assert(source.includes('selectCampus'), 'Must have campus selector label');
console.log('✓ Multi-campus selection verified.');

// 5. Service Availability
console.log('Checking #5: Service availability selection...');
assert(source.includes('availabilityLabel'), 'Must have availability selection');
assert(source.includes('availSunday'), 'Must have Sunday services availability');
assert(source.includes('availFriday'), 'Must have Friday fasting prayer availability');
assert(source.includes('toggleAvailability'), 'Must support toggling availability chips');
console.log('✓ Service availability verified.');

// 6. Contact & WhatsApp Selection
console.log('Checking #6: Phone & preferred contact method...');
assert(source.includes('phoneLabel'), 'Must have phone/whatsapp label');
assert(source.includes('contactWhatsApp'), 'Must support WhatsApp contact');
assert(source.includes('contactCall'), 'Must support Phone Call contact');
assert(source.includes('contactEmail'), 'Must support Email contact');
console.log('✓ Contact options verified.');

// 7. Department Quick Skills & Spiritual Gifts Tags
console.log('Checking #7: Quick skills tags for departments...');
assert(source.includes('quickTags'), 'Ministries must specify quickTags');
assert(source.includes('toggleQuickTag'), 'Must support 1-tap quick skills tagging');
console.log('✓ Quick skills tagging verified.');

// 8. Application Status Tracking
console.log('Checking #8: My Applications status tracking...');
assert(source.includes('myApplications'), 'Must maintain myApplications state');
assert(source.includes('appStatusPending'), 'Must display application status badge');
assert(source.includes('kcm_volunteers_'), 'Must persist volunteer applications');
console.log('✓ Application tracking verified.');

// 9. Pastoral Care Helpline
console.log('Checking #9: Pastoral volunteer helpline & WhatsApp care...');
assert(source.includes('+919505288171') || source.includes('95052 88171'), 'Must include pastoral helpline number');
assert(source.includes('coordinatorHelp'), 'Must include pastoral care banner');
console.log('✓ Pastoral care helpline verified.');

// 10. Trilingual Localization
console.log('Checking #10: Trilingual localization (EN, TE, HI)...');
assert(source.includes('te: {'), 'Must include Telugu translations');
assert(source.includes('hi: {'), 'Must include Hindi translations');
assert(source.includes('వాలంటీర్ దరఖాస్తు పోర్టల్'), 'Telugu title must exist');
assert(source.includes('स्वयंसेवक आवेदन पोर्टल'), 'Hindi title must exist');
console.log('✓ Trilingual localization verified.');

console.log('\n======================================================');
console.log('ALL MEMBER VOLUNTEER UI/UX VERIFICATION TESTS PASSED! 🚀');
console.log('======================================================');
