# Multilingual System Testing Guide

## Automated Translation Key Audit
Runs recursive key parity analysis between canonical English, Telugu, and Hindi:

```bash
npm run i18n:check
```

Success criteria:
- 0 missing keys
- 0 malformed strings
- Exit code 0

---

## Playwright E2E Testing

Runs cross-browser language switching and persistence tests:

```bash
npx playwright test tests/e2e/language-switch.spec.ts
```

What is verified:
1. Initial page loads in canonical English (`<html lang="en">`).
2. Switching to Telugu changes the UI to Telugu without remaining English fragments and updates `<html lang="te">`.
3. Navigating to `/about/story`, `/events`, `/sermons`, `/prayer`, `/ngo`, `/login` preserves the Telugu locale.
4. Refreshing the browser preserves the Telugu locale.
5. Switching to Hindi changes the UI to Hindi (`<html lang="hi">`) across public and auth routes.
6. Refreshing preserves Hindi.
7. Switching back to English restores English everywhere.
8. Language selector keyboard navigation (`Enter`, `Escape`, `Tab`, `Arrow` keys).

---

## Manual Accessibility & Cross-Browser Checklist
- **Keyboard Navigation**: Press `Alt+L` or `Ctrl+K` to trigger preferences, use `Tab` to enter `LanguageToggle`, press `Enter` to open, `Escape` to close.
- **Mobile Viewports**: Test on 320px (iPhone SE), 360px (Samsung Galaxy), 390px (iPhone 14), 768px (iPad), and 1280px+ (Desktop).
- **Samsung Internet Compatibility**: Verify font rendering and high-contrast color scheme without dark-mode text inversion issues.
