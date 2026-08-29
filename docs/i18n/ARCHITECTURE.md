# Multilingual System Architecture

## Overview
The KCM Multilingual Architecture provides centralized, type-safe, and zero-flicker localization across all server-rendered and client-rendered routes.

---

## Core Pillars

### 1. Centralized Dictionaries (`/frontend/i18n/locales`)
- **Canonical Source (`en.ts`)**: Defines the definitive keys and source English text.
- **Telugu (`te.ts`)**: Contains natural, grammatically correct Telugu in standard Telugu Unicode.
- **Hindi (`hi.ts`)**: Contains natural, grammatically correct Hindi in standard Devanagari Unicode.

### 2. Dual-Layer Persistence Engine
Language selection is persisted across both:
1. **`localStorage.setItem('language', lang)`**: For instant client-side retrieval across reloads.
2. **`document.cookie = "kcm-lang=lang;path=/;max-age=31536000;SameSite=Lax"`**: For SSR header inspection and edge routing without hydration mismatch.
3. **Window Custom Event (`kcm-language-change`)**: Dispatched on language switch for real-time synchronization across independent components.

### 3. Graceful Fallback Engine
When resolving translation keys:
1. Attempt retrieval from current active locale (`translations[language]`).
2. If undefined or empty, automatically retrieve canonical English equivalent (`translations.en`).
3. If still unresolved, fallback to provided `defaultText` or raw key identifier.
4. Missing keys log a diagnostic warning in development and never output `undefined` or `[object Object]` to end users.

### 4. Locale-Aware Formatters
- **`formatCurrency(amount, currency)`**: Automatically formats currency values using Indian numbering system standard (e.g. `₹1,00,000`).
- **`formatDate(date, options)`**: Formats dates according to `en-IN`, `te-IN`, and `hi-IN` standards.
- **`formatNumber(num)`**: Formats numbers using regional grouping separators.

### 5. Font Stack & Cross-Browser Safety
The platform injects Google Fonts loaders for:
- `Inter` & `Outfit` (Latin)
- `Noto_Sans_Telugu` (Telugu Unicode glyphs)
- `Noto_Sans_Devanagari` (Devanagari Unicode glyphs)

This prevents glyph clipping, missing character boxes (`□`), or layout breakage on mobile browsers (Samsung Internet, Vivo, Oppo, iOS Safari, Chrome Android).
