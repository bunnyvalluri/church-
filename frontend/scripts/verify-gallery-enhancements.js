const fs = require('fs');
const path = require('path');

const galleryFilePath = path.join(__dirname, '../app/gallery/page.tsx');
const cssFilePath = path.join(__dirname, '../app/globals.css');
const content = fs.readFileSync(galleryFilePath, 'utf8');
const cssContent = fs.readFileSync(cssFilePath, 'utf8');

const tests = [
  {
    name: "1.1 Lightbox Overlay Higher Z-Index than Floating Navbar (z-[99999] > z-[1000])",
    fn: () => content.includes('className="fixed inset-0 z-[99999] flex flex-col bg-black/98 backdrop-blur-3xl select-none"') &&
              content.includes('data-lightbox-modal="true"')
  },
  {
    name: "1.2 Video Modal Higher Z-Index than Floating Navbar (z-[99999] > z-[1000])",
    fn: () => content.includes('className="fixed inset-0 z-[99999] bg-black/98 backdrop-blur-3xl flex flex-col select-none"')
  },
  {
    name: "1.3 Restored Top Modal Bar with Counter (X / Y), Campus Badge, and Title",
    fn: () => content.includes('pt-[max(0.75rem,env(safe-area-inset-top))]') &&
              content.includes('{lightboxIndex + 1} / {filteredItems.length}') &&
              content.includes('currentLightboxLocalized?.category')
  },
  {
    name: "1.4 Auto-Play Slideshow Toggle and Prominent Close (X) Button in Top Bar",
    fn: () => content.includes('setIsSlideshowPlaying((prev) => !prev)') &&
              content.includes('gt.pauseSlideshow') &&
              content.includes('gt.playSlideshow') &&
              content.includes('setLightboxIndex(null)') &&
              content.includes('<X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />')
  },
  {
    name: "2.1 Suppress Floating Page Widgets while Lightbox is Open via data-gallery-lightbox-open",
    fn: () => content.includes('document.documentElement.setAttribute("data-gallery-lightbox-open", "true");') &&
              content.includes('document.documentElement.removeAttribute("data-gallery-lightbox-open");') &&
              cssContent.includes('html[data-gallery-lightbox-open="true"]')
  },
  {
    name: "2.2 Navigation Chevrons have Comfortable Inset & z-30 inside Lightbox",
    fn: () => content.includes('left-2.5 sm:left-6 z-30') &&
              content.includes('right-2.5 sm:right-6 z-30')
  },
  {
    name: "2.3 Directional Touch Swipe Gestures (Horizontal > Vertical & > 40px)",
    fn: () => content.includes('onTouchStart') &&
              content.includes('onTouchEnd') &&
              content.includes('Math.abs(diffX) > Math.abs(diffY)') &&
              content.includes('Math.abs(diffX) > 40')
  },
  {
    name: "2.4 Keyboard Navigation (ArrowLeft, ArrowRight, Escape, Spacebar)",
    fn: () => content.includes('e.key === "Escape"') &&
              content.includes('e.key === "ArrowRight"') &&
              content.includes('e.key === "ArrowLeft"') &&
              content.includes('e.key === " " || e.key === "Spacebar"')
  },
  {
    name: "3.1 Zero-Lag Next / Previous Image Preloading (next/prev prefetch)",
    fn: () => content.includes('const nextIdx = (lightboxIndex + 1) % filteredItems.length;') &&
              content.includes('const prevIdx = (lightboxIndex - 1 + filteredItems.length) % filteredItems.length;') &&
              content.includes('const img = new window.Image();') &&
              content.includes('img.src = encodeSrc(url);')
  },
  {
    name: "3.2 Body Scroll Lock (overflow: hidden) when Lightbox or Video Modal is Active",
    fn: () => content.includes('document.body.style.overflow = "hidden";') &&
              content.includes('document.body.style.overflow = originalOverflow;')
  },
  {
    name: "3.3 Bottom Thumbnail Scrubber has Safe Area Inset for Mobile Gestures",
    fn: () => content.includes('pb-[max(0.75rem,env(safe-area-inset-bottom))]') &&
              content.includes('ref={thumbnailContainerRef}')
  },
  {
    name: "3.4 Video Theater Click-to-Play Facades & Persistent Favorites",
    fn: () => content.includes('YouTubeThumbnail') &&
              content.includes('isVideoPlaying ? (') &&
              content.includes('localStorage.getItem("kcm-gallery-favorites")')
  }
];

let passed = 0;
console.log("=================================================");
console.log("🚀 KCM CHURCH GALLERY LIGHTBOX AUDIT & VERIFICATION");
console.log("=================================================");

tests.forEach((t) => {
  const ok = t.fn();
  if (ok) {
    passed++;
    console.log(`✅ PASS: ${t.name}`);
  } else {
    console.error(`❌ FAIL: ${t.name}`);
  }
});

console.log("-------------------------------------------------");
console.log(`Result: ${passed}/${tests.length} tests passed (${Math.round((passed / tests.length) * 100)}%)`);

if (passed !== tests.length) {
  process.exit(1);
}
