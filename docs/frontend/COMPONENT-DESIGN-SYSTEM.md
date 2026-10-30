# KCM Church — Unified White-Theme Component Design System

**Design Philosophy**: Pure Minimalist White Theme (`forcedTheme="light"`) • Royal Violet (#6D28D9) & Warm Gold (#B45309) Accents • WCAG 2.1 AA Compliant Contrast (>4.5:1 text on white) • Touch Targets (min 44x44px).

---

## 1. Design Tokens Specification

```typescript
// Backgrounds & Surfaces
background: '#FFFFFF';         // Pure White Canvas
surface: '#F8FAFC';            // Slate 50 (Soft secondary card background)
surfaceMuted: '#F1F5F9';       // Slate 100 (Table headers, inputs)

// Brand Accents
brand.primary: '#6D28D9';      // Violet 700 (Primary buttons, active states)
brand.primaryHover: '#5B21B6'; // Violet 800
brand.accentGold: '#B45309';   // Amber 700 (Special highlights, tithe badges)

// High-Contrast Typography
text.primary: '#0F172A';       // Slate 900 (16.5:1 contrast against white)
text.secondary: '#334155';     // Slate 700 (7.5:1 contrast)
text.muted: '#64748B';         // Slate 500 (4.6:1 contrast - exceeds AA)
```

---

## 2. Design System Components Catalog

The design system is located in [`frontend/src/components/ui/`](file:///C:/K.C.M-Portal/frontend/src/components/ui) and re-exported via [`frontend/components/ui/index.ts`](file:///C:/K.C.M-Portal/frontend/components/ui/index.ts):

| Component | File | Key Features & Accessibility |
|---|---|---|
| `Button` | `Button.tsx` | Variants: `primary`, `secondary`, `outline`, `ghost`, `link`, `destructive`, `gold`. Sizes: `sm`, `default` (44px min-height), `lg`, `icon`. Shimmer loading spinner, active scale transform. |
| `Input` | `Input.tsx` | Accessible label, helper text, error states, `aria-invalid`, `aria-describedby`, focus rings in Violet 700. |
| `Select` | `Select.tsx` | Native styled select dropdown with chevron icon, option grouping, and accessible label integration. |
| `Textarea` | `FormControls.tsx` | Multiline input with focus rings and character limit indicator. |
| `Checkbox` | `FormControls.tsx` | 20x20px accessible checkbox with label and secondary description. |
| `RadioGroup` | `FormControls.tsx` | Radio list with card borders, keyboard arrow navigation, and selection feedback. |
| `Switch` | `FormControls.tsx` | Toggle switch meeting 44px min-width touch target, animated thumb translation. |
| `Dialog` | `Dialog.tsx` | Radix UI modal dialog, backdrop blur, Escape key dismissal, focus trap, and animated zoom entrance. |
| `DropdownMenu` | `NavigationControls.tsx` | Radix UI dropdown with submenus, item icons, and separator dividers. |
| `Tabs` | `NavigationControls.tsx` | Radix UI tabs with white active pill elevation and animated tab panel switching. |
| `Accordion` | `NavigationControls.tsx` | Accessible expandable panel with chevron rotation. |
| `Tooltip` | `NavigationControls.tsx` | Hover/focus tooltip with z-index elevation and safe boundary placement. |
| `Card` | `FeedbackDisplay.tsx` | White surface card with `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`. |
| `Badge` | `FeedbackDisplay.tsx` | Status pills: `default`, `secondary`, `outline`, `success`, `warning`, `destructive`, `gold`. |
| `Alert` | `FeedbackDisplay.tsx` | Semantic banner: `info`, `success`, `warning`, `error`, with dismiss button. |
| `Skeleton` | `FeedbackDisplay.tsx` | Pulse shimmer placeholder preventing layout shift (CLS < 0.02). |
| `Avatar` | `FeedbackDisplay.tsx` | Profile image with graceful initials fallback on error. |
| `DataTable` | `DataControls.tsx` | Responsive data table with striped hover rows, empty states, and custom column renderers. |
| `Pagination` | `DataControls.tsx` | Page navigation with accessible Previous/Next icon buttons. |
| `Breadcrumb` | `DataControls.tsx` | Slash-separated hierarchical page location breadcrumb. |
| `FileUploader` | `DataControls.tsx` | Drag-and-drop file upload container with size validation and preview. |
| `ImageViewer` | `DataControls.tsx` | Fullscreen lightbox modal with high-resolution image preview. |

