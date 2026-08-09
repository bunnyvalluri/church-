# Universal Mobile Testing Checklist

## Viewport Sizing & Responsiveness
- [x] **320px (iPhone SE 1st gen)**: Verified zero horizontal scrolling, hamburger drawer fits viewport, text wraps cleanly.
- [x] **360px (Samsung Galaxy)**: Verified hero titles, stat cards, and primary buttons maintain high-contrast legibility.
- [x] **375px (iPhone 13 Mini)**: Verified navbar elements align, touch targets >= 44x44px.
- [x] **390px (iPhone 14 / Pixel)**: Verified full modal overlay fits without clipping.
- [x] **412px (Samsung S22 / Pixel 7)**: Verified CSS grid layouts wrap cleanly.
- [x] **430px (iPhone 15 Pro Max)**: Verified Dynamic Island safe-area inset spacing.
- [x] **768px (iPad Mini / Tablet)**: Verified tablet navigation bar renders correctly.
- [x] **1024px+ (iPad Pro / Desktop)**: Verified full desktop navigation menu displays cleanly.

## Mobile Browsers
- [x] **Google Chrome (Android & iOS)**
- [x] **Samsung Internet (Android)**
- [x] **Safari (iOS WebKit)**
- [x] **Firefox Mobile**
- [x] **Microsoft Edge Mobile**
- [x] **Brave Mobile**
- [x] **Mi Browser / OPPO Browser / vivo Browser**

## Touch Interactions
- [x] Minimum 44x44px touch targets on buttons, menu icons, and links.
- [x] Mobile drawer opens smoothly, locks body scroll, dismisses on outside tap or Escape.
- [x] Form inputs set to 16px minimum font size on mobile to prevent browser zoom.
- [x] Touch scrolling smooth with `-webkit-overflow-scrolling: touch`.

## Network & Offline Resilience
- [x] Real API health pinging detects server availability.
- [x] Offline status indicator displays non-intrusively.
- [x] Service Worker `v3` handles static asset caching and network-only payment isolation.
- [x] Payments blocked while offline with explicit user notification.

## Light & Dark Mode
- [x] Crisp contrast on dark mode (`#05050A`) for hero text, titles, subtitles, and logos.
- [x] High-contrast button styles across light and dark theme toggles.
