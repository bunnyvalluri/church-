# KCM Design System & Minimalist White Theme

## 1. Visual Identity Principles
The KCM Church portal uses a modern, high-contrast, minimalist **Pure White Theme**:
- **Background**: `#FFFFFF` (Primary Surface) with `#F8FAFC` (Slate-50) subtle section separation.
- **Typography**: Clean sans-serif typography (Inter / System UI) with strict scale hierarchy (12px, 14px, 16px, 18px, 20px, 24px, 32px, 48px).
- **Brand Accent**: Rich Violet / Purple (`#7C3AED` to `#6D28D9`) for primary actions, badges, and active state highlights.
- **Borders & Elevation**: Light 1px slate borders (`#E2E8F0`) paired with subtle ambient box-shadows (`0 1px 3px rgba(0,0,0,0.05)`).

## 2. White Theme Consistency & Auto-Darkening Protection
To prevent unwanted auto-darkening transformations on Android / Samsung Internet:
```css
:root {
  color-scheme: light only;
  forced-color-adjust: none;
}
```
All cards, dialogs, dropdowns, and form inputs specify explicit white backgrounds (`bg-white`) and dark readable text (`text-slate-900`) to ensure 100% theme fidelity across all browser engines.
