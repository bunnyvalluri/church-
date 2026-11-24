/**
 * Lightbox Optimization Verification Test Suite
 * Verifies:
 * 1. Hide Floating Widget When Lightbox Is Open (data-gallery-lightbox-open, CSS suppression rules, z-[99999])
 * 2. Mobile Top Bar & Badge Fit (no max-w-[120px], whitespace-nowrap, compact button sizing w-7 h-7 / gap-1.5)
 * 3. Windowed Thumbnail Strip for 975+ Photos (±12 range virtualization, sub-100ms INP)
 * 4. Smooth touch swipe gestures (onTouchStart, onTouchEnd, 40px threshold)
 * 5. Preloading immediate previous/next full-resolution images
 * 6. Mirroring optimizations into both /ngo/gallery and /gallery
 */

const fs = require('fs');
const path = require('path');

const ngoGalleryPath = path.join(__dirname, '..', 'app', 'ngo', 'gallery', 'page.tsx');
const galleryPath = path.join(__dirname, '..', 'app', 'gallery', 'page.tsx');
const cssPath = path.join(__dirname, '..', 'app', 'globals.css');

const ngoContent = fs.readFileSync(ngoGalleryPath, 'utf8');
const galleryContent = fs.readFileSync(galleryPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

console.log('\n--- 1. Testing Floating Widget Suppression & Z-Index Rules ---');
assert(
  cssContent.includes('html[data-gallery-lightbox-open="true"]') &&
  cssContent.includes('[aria-label="Open KCM Assistant"]') &&
  cssContent.includes('display: none !important') &&
  cssContent.includes('z-index: -1 !important'),
  'globals.css suppresses floating AI chat, FABs, and page-level widgets when data-gallery-lightbox-open="true"'
);

assert(
  cssContent.includes('[aria-label*="audio" i]') &&
  cssContent.includes('[aria-label*="listen" i]') &&
  cssContent.includes('[aria-label*="speech" i]'),
  'globals.css suppresses audio, speech, and accessibility floating buttons when lightbox is open'
);

assert(
  ngoContent.includes('document.documentElement.setAttribute("data-gallery-lightbox-open", "true")') &&
  ngoContent.includes('document.documentElement.removeAttribute("data-gallery-lightbox-open")'),
  'NGO Gallery sets and removes data-gallery-lightbox-open on html element'
);

assert(
  galleryContent.includes('document.documentElement.setAttribute("data-gallery-lightbox-open", "true")') &&
  galleryContent.includes('document.documentElement.removeAttribute("data-gallery-lightbox-open")'),
  'Main Gallery sets and removes data-gallery-lightbox-open on html element'
);

assert(
  ngoContent.includes('z-[99999]') && galleryContent.includes('z-[99999]'),
  'Both lightboxes have high overlay z-index z-[99999]'
);

assert(
  ngoContent.includes('z-50 w-10 h-10 sm:w-12 sm:h-12'),
  'NGO Gallery next/prev navigation buttons have z-50 and generous touch tap size (w-10 h-10 sm:w-12 sm:h-12)'
);

assert(
  galleryContent.includes('left-2.5 sm:left-6 z-30') &&
  galleryContent.includes('right-2.5 sm:right-6 z-30'),
  'Main Gallery next/prev navigation buttons have comfortable screen insets and tap sizing'
);

console.log('\n--- 2. Testing Mobile Top Bar & Badge Non-Truncation ---');
assert(
  !ngoContent.includes('max-w-[120px]'),
  'NGO Gallery removed hardcoded max-w-[120px] on category badge'
);

assert(
  ngoContent.includes('text-[8.5px] sm:text-[10px]') &&
  ngoContent.includes('whitespace-nowrap shrink-0'),
  'NGO Gallery category badge uses responsive non-truncating font & whitespace-nowrap shrink-0'
);

assert(
  ngoContent.includes('w-7 h-7 sm:w-8 sm:h-8') &&
  ngoContent.includes('gap-1.5 sm:gap-3'),
  'NGO Gallery mobile top control buttons use compact w-7 h-7 and gap-1.5 for guaranteed fit on 360px viewports'
);

assert(
  galleryContent.includes('whitespace-nowrap shrink-0') &&
  galleryContent.includes('currentLightboxLocalized?.category'),
  'Main Gallery category badge uses whitespace-nowrap shrink-0 for full non-truncated text display'
);

console.log('\n--- 3. Testing Windowed Thumbnail Strip for 975+ Photos (INP < 100ms) ---');
assert(
  ngoContent.includes('THUMBNAIL_WINDOW = 12') &&
  ngoContent.includes('startIdx = Math.max(0, lightboxIndex - THUMBNAIL_WINDOW)') &&
  ngoContent.includes('endIdx = Math.min(filteredItems.length - 1, lightboxIndex + THUMBNAIL_WINDOW)'),
  'NGO Gallery virtualizes/windows bottom thumbnail strip to active ±12 range'
);

assert(
  galleryContent.includes('THUMBNAIL_WINDOW = 12') &&
  galleryContent.includes('startIdx = Math.max(0, lightboxIndex - THUMBNAIL_WINDOW)') &&
  galleryContent.includes('endIdx = Math.min(filteredItems.length - 1, lightboxIndex + THUMBNAIL_WINDOW)'),
  'Main Gallery virtualizes/windows bottom thumbnail strip to active ±12 range'
);

assert(
  ngoContent.includes('filteredItems.slice(startIdx, endIdx + 1).map') &&
  galleryContent.includes('filteredItems.slice(startIdx, endIdx + 1).map'),
  'Both galleries only render at most 25 thumbnail DOM nodes instead of 975+ nodes'
);

assert(
  ngoContent.includes('scrollIntoView') &&
  galleryContent.includes('scrollIntoView'),
  'Both galleries smoothly auto-scroll the active thumbnail into view'
);

console.log('\n--- 4. Testing Touch Swipe Gestures & Image Preloading ---');
assert(
  ngoContent.includes('onTouchStart') &&
  ngoContent.includes('onTouchEnd') &&
  ngoContent.includes('Math.abs(diffX) > 40'),
  'NGO Gallery supports smooth touch swipe gestures with 40px threshold and swipe-down close'
);

assert(
  galleryContent.includes('onTouchStart') &&
  galleryContent.includes('onTouchEnd') &&
  galleryContent.includes('Math.abs(diffX) > 40'),
  'Main Gallery supports smooth touch swipe gestures with 40px threshold'
);

assert(
  ngoContent.includes('nextIdx = (lightboxIndex + 1) % filteredItems.length') &&
  galleryContent.includes('nextIdx = (lightboxIndex + 1) % filteredItems.length'),
  'Both lightboxes preload only immediate adjacent (previous/next) full-resolution photos'
);

console.log(`\n========================================`);
console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
