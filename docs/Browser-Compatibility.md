# Cross-Browser & Multi-Platform Compatibility Matrix

## Purpose
This document provides the authoritative compatibility specification, platform support tiers, browser-specific polyfills, and testing matrix for the Kingdom of Christ Ministries web application.

## Scope
Covers modern desktop and mobile browsers across Android, iOS, Windows, macOS, Linux (Ubuntu), and ChromeOS.

## Status
> Status: Implemented & Verified

---

## 1. Supported Browsers & OS Matrix

The application is engineered and continuously validated against standard modern browser engines: **Blink (Chromium)**, **WebKit (Apple)**, and **Gecko (Mozilla)**.

| Browser Engine | Browser Name | Minimum Supported Version | Platform | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Blink** | Google Chrome | `v100+` | Windows, macOS, Linux, Android, ChromeOS | `Supported & Verified` |
| **WebKit** | Apple Safari | `v15.4+` | macOS (Monterey+), iOS (15+) | `Supported & Verified` |
| **Gecko** | Mozilla Firefox | `v105+` | Windows, macOS, Linux, Android | `Supported & Verified` |
| **Blink** | Microsoft Edge | `v100+` | Windows, macOS, Android, iOS | `Supported & Verified` |
| **Blink** | Samsung Internet | `v18.0+` | Android | `Supported & Verified` |
| **WebKit** | iOS WKWebView (PWA) | iOS 15.0+ | iPhone, iPad | `Supported & Verified` |
| **Blink** | Android System WebView| Android 9.0+ (Pie+) | Android Phones & Tablets | `Supported & Verified` |

---

## 2. Web API Feature Support Matrix

| Web Feature / API | Chrome / Edge | Safari (macOS & iOS) | Firefox | Samsung Internet | Fallback Mechanism |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Service Workers** | ✅ Full | ✅ Full (15.4+) | ✅ Full | ✅ Full | Graceful degradation to standard online HTTP |
| **IndexedDB** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | Local in-memory session cache |
| **Web Push (FCM)** | ✅ Full | ✅ Full (iOS 16.4+ / macOS 13+) | ✅ Full | ✅ Full | Automated Email & SMS alerts |
| **CSS Backdrop Filter**| ✅ Full | ✅ Full (`-webkit-`) | ✅ Full | ✅ Full | Solid semi-opaque background color |
| **WebP / AVIF Images** | ✅ Full | ✅ Full (iOS 16+ for AVIF) | ✅ Full | ✅ Full | Cloudinary `f_auto` delivers JPEG fallback |
| **MapLibre GL WebGL** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | Static fallback location map images |

---

## 3. Browser-Specific Workarounds & Fixes

1. **Safari 100vh Layout Jump**: Safari dynamically resizes browser viewports when address bars collapse. The CSS design system uses `100dvh` and `svh` units to guarantee stable full-screen modal overlays.
2. **Safari Date Parsing**: Safari rejects non-standard ISO date strings (`YYYY-MM-DD HH:mm`). All dates are standardized using `date-fns` before formatting in UI components.
3. **Samsung Internet High Contrast Mode**: Ensured semantic CSS border tokens (`border-border`) remain visible when users enable Samsung Internet's forced High Contrast Theme.
4. **Firefox Scrollbar Styling**: Configured standard `scrollbar-width: thin; scrollbar-color: ...` alongside webkit scrollbar rules.

---

## 4. Automated Cross-Browser Testing Pipeline

Browser compatibility is asserted continuously via Playwright test suites (`frontend/playwright.config.ts`):
```bash
# Execute full cross-browser test suite across Chromium, WebKit, and Firefox
npm run test:e2e -w frontend
```

---

## 5. Troubleshooting & Diagnostics

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| PWA Install prompt not appearing in iOS Safari | iOS Safari does not support `BeforeInstallPromptEvent` | Display customized visual instructions: "Tap Share -> Add to Home Screen". |
| Web Push notifications failing on older iOS | iOS version < 16.4 or app not installed to Home Screen | On iOS, Web Push requires PWA Home Screen installation. Prompt user to install PWA first. |

---

## Security Considerations
- Feature detection (`if ('serviceWorker' in navigator)`) is always used instead of brittle user-agent sniffing.

## Related Documentation
- [Responsive-Design.md](Responsive-Design.md) — Viewport layout standards.
- [Testing.md](Testing.md) — Playwright test execution guides.
- [PWA.md](PWA.md) — Progressive Web App installation guidelines.
