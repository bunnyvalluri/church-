# KCM Cross-Browser Compatibility Specification

## 1. Engine & Platform Matrix

| Browser Engine | Representative Browsers | Key Optimizations Implemented |
| :--- | :--- | :--- |
| **Blink / Chromium** | Google Chrome, Edge, Brave | Standard Web Component styling, WebP image delivery |
| **WebKit** | Apple Safari (iOS / iPadOS / macOS) | Dynamic viewport units (`100dvh`), `touch-action: manipulation` |
| **Samsung Internet**| Samsung Galaxy Devices | `color-scheme: light only` auto-darkening override, safe-area insets |
| **Gecko** | Mozilla Firefox | Standard scrollbar styling, CSS grid alignment |

## 2. iOS Safari & Mobile Viewport Fixes
- Replaced `100vh` in full-height layouts with `100dvh` (Dynamic Viewport Height) to prevent bottom navigation controls from clipping modal action buttons.
- Applied `env(safe-area-inset-bottom)` to fixed bottom navigation bars on notched iPhone screens.
