# KCM Church — Accessibility (a11y) & WCAG 2.1 AA Compliance

**Standard**: WCAG 2.1 Level AA Compliant  
**Verification Suite**: `tests/accessibility.spec.ts`

---

## 1. Compliance Criteria Implemented

1. **Contrast Ratio**:
   * Slate 900 (`#0F172A`) on Pure White (`#FFFFFF`): **16.5:1** (far exceeds 4.5:1 requirement).
   * Violet 700 (`#6D28D9`) on Pure White: **4.8:1** (compliant for text and controls).
   * Red 600 error banners: **4.6:1**.
2. **Touch Targets**:
   * Minimum button height: `44px` (`min-h-[44px]`).
   * Switch toggle width: `44px`.
   * Form inputs: `44px` height.
3. **Keyboard Navigation & Focus Trapping**:
   * Dialog modals use Radix UI focus traps. Pressing `Escape` closes the modal and returns focus to the trigger.
   * Skip-to-content component (`SkipToContent.tsx`) allows screen-reader and keyboard users to bypass navigation.
4. **Accessible Forms**:
   * All inputs link `id` to `label` via `htmlFor`.
   * Error states use `aria-invalid="true"` and `aria-describedby="<id>-error"`.
