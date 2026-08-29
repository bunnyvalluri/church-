# Adding a New Language

Step-by-step guide to adding a new language to the KCM platform.

---

## 1. Register Language in Configuration

Open `frontend/i18n/config.ts` and add the language code to `SUPPORTED_LANGUAGES`:

```ts
export const SUPPORTED_LANGUAGES = ['en', 'te', 'hi', 'ta'] as const;
```

Add the language metadata:

```ts
export const LANGUAGE_METADATA: Record<Language, LanguageMeta> = {
  ...
  ta: {
    code: 'ta',
    label: 'Tamil',
    nativeName: 'தமிழ்',
    short: 'TA',
    dir: 'ltr',
    locale: 'ta-IN',
    fontFamily: '"Noto Sans Tamil", sans-serif',
  },
};
```

---

## 2. Create the Locale Dictionary

Create `frontend/i18n/locales/ta.ts` copying the structure of `en.ts` and providing localized strings for all keys.

```ts
export const ta = {
  nav: {
    home: "முகப்பு",
    about: "எங்களைப் பற்றி",
    ...
  },
  ...
};

export default ta;
```

---

## 3. Export in Master Dictionary

In `frontend/i18n/index.ts`:

```ts
import { ta } from './locales/ta';

export const translations = {
  en,
  te,
  hi,
  ta,
};

export { en, te, hi, ta };
```

---

## 4. Run Parity Audit

Execute the automated audit tool to verify 100% key parity:

```bash
npm run i18n:check
```

The script will identify any missing or untranslated keys.
