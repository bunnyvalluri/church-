# Kingdom of Christ Ministries (KCM) — Multilingual (i18n) Architecture

This directory contains the official documentation, architectural specifications, guidelines, and testing protocols for the multilingual localization system across the KCM web platform.

---

## 🌐 Supported Languages

| Code | Language | Native Script | Direction | Font Stack | Regional Locale |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `en` | English | English | `ltr` | Inter / Outfit | `en-IN` |
| `te` | Telugu | తెలుగు | `ltr` | Noto Sans Telugu | `te-IN` |
| `hi` | Hindi | हिंदी | `ltr` | Noto Sans Devanagari | `hi-IN` |

---

## 📁 Directory Structure

```
frontend/
├── i18n/
│   ├── config.ts              # Configuration, metadata, supported languages, fallback
│   ├── index.ts               # Core module exports (useLanguage, translations, utils)
│   ├── locales/
│   │   ├── en.ts              # Canonical English dictionary (2,150+ verified keys)
│   │   ├── te.ts              # Natural, authentic Telugu dictionary (proper Unicode)
│   │   └── hi.ts              # Natural, authentic Hindi dictionary (Devanagari)
│   ├── types/
│   │   └── translations.ts    # TypeScript definitions & KeyPath helpers
│   └── utils/
│       ├── language.ts        # Detection, localStorage & cookie persistence engine
│       └── translation.ts     # Dot-notation resolver, safe fallback & interpolation
├── components/
│   ├── LanguageToggle.tsx     # Accessible floating/portal language dropdown
│   └── providers/
│       └── LanguageProvider.tsx # Universal React context & state orchestrator
└── scripts/
    ├── check-i18n.js          # Automated CI audit script for 100% key parity
    └── build-locales.js       # Dictionary builder & transformer
```

---

## 🚀 Quick Usage

### React Client Components
```tsx
"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export default function MyComponent() {
  const { t, language, setLanguage, formatDate, formatCurrency } = useLanguage();

  return (
    <div>
      <h1>{t.hero.welcome} {t.hero.churchName}</h1>
      <p>{t.services.title}</p>
      <span>{formatCurrency(1000)}</span>
      <span>{formatDate(new Date())}</span>
      <button onClick={() => setLanguage("te")}>తెలుగు</button>
    </div>
  );
}
```

---

## 🛠️ Validation & Verification

Run the automated translation parity audit:
```bash
npm run i18n:check
```

Run end-to-end multilingual tests:
```bash
npx playwright test tests/e2e/language-switch.spec.ts
```

Run TypeScript compilation check:
```bash
npm run typecheck
```
