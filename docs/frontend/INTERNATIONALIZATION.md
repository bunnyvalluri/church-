# KCM Church — Internationalization & Multilingual Architecture

**Engine**: [`frontend/src/i18n/index.ts`](file:///C:/K.C.M-Portal/frontend/src/i18n/index.ts)  
**Supported Languages**: English (`en`), Telugu (`te`), Hindi (`hi`)  
**Parity Metric**: 100% key parity across all 2,283 dictionary keys.

---

## 1. Dictionary Structure
* English: [`frontend/i18n/locales/en.ts`](file:///C:/K.C.M-Portal/frontend/i18n/locales/en.ts) (Canonical source of truth).
* Telugu: [`frontend/i18n/locales/te.ts`](file:///C:/K.C.M-Portal/frontend/i18n/locales/te.ts).
* Hindi: [`frontend/i18n/locales/hi.ts`](file:///C:/K.C.M-Portal/frontend/i18n/locales/hi.ts).

---

## 2. Formatting Helpers
* `formatCurrencyINR(amount, locale)`: Formats Indian Rupee values according to local standard (e.g. ₹1,00,000 in `en-IN` / `te-IN` / `hi-IN`).
* `formatDateLocale(date, locale)`: Formats dates with appropriate localization and script.

---

## 3. Translation Parity CI Verification
Every commit triggers `npm run i18n:check`, which audits dictionary trees key-by-key and fails the build if any keys are missing or orphaned.

