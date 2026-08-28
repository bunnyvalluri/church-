# Responsive Design & Mobile Viewport Specification

## Purpose
This document specifies the responsive design standards, mobile-first breakpoint systems, touch interaction ergonomics, and fluid layout paradigms implemented across the Kingdom of Christ Ministries platform.

## Scope
Covers all pages, portals, forms, tables, modals, and navigation components across desktop, tablet, and mobile viewports.

## Status
> Status: Implemented

---

## 1. Responsive Philosophy & Mobile-First Principles

With over 70% of church members accessing sermon audio, event registrations, and prayer submissions from mobile smartphones, all components are engineered **mobile-first** and progressively enhanced for larger viewports:

- **Single Column Base**: Base CSS rules target mobile screens (320px - 639px).
- **Progressive Multi-Column Grid**: Grid expansions (`grid-cols-2`, `grid-cols-3`) are introduced only at `md` and `lg` breakpoints.
- **Dynamic Viewport Height**: Uses `100dvh` instead of `100vh` to avoid mobile browser address bar jumpiness.

---

## 2. Tailwind CSS Breakpoint Matrix

| Breakpoint Prefix | Min Width | Target Device Category | Layout Strategy |
| :--- | :--- | :--- | :--- |
| **Default (Base)**| `< 640px` | Small to Large Smartphones (iPhone SE, iPhone 15, Galaxy S24) | Single column vertical stack, bottom navigation bar, full-screen sheets |
| `sm` | `640px` | Large Phablets & Mini Tablets (iPad Mini portrait) | 2-column compact grids, horizontal button groupings |
| `md` | `768px` | Standard Tablets (iPad portrait, Android tablets) | 2-column content + sidebar cards, desktop header navigation |
| `lg` | `1024px` | Small Laptops & Tablets Landscape (iPad Pro) | 3-column sermon/event grids, persistent portal sidebar |
| `xl` | `1280px` | Desktop Monitors & High-Res Laptops | Full 3-4 column layouts with max-width content container (1280px) |
| `2xl` | `1536px` | Large Desktop Displays | Centered container (`max-w-7xl mx-auto`) to prevent over-stretched lines |

---

## 3. Touch Ergonomics & Safe Area Insets

### 3.1 Touch Target Sizes
All interactive elements (buttons, inputs, dropdown triggers, pagination links) enforce a minimum touch target bounding box of **44x44 CSS pixels** to satisfy Apple HIG and Google Material guidelines.

### 3.2 Safe Area Inset Support
Fixed headers and mobile bottom navigation bars respect device hardware notches, home indicator bars, and dynamic islands using CSS environment variables:
```css
.mobile-nav-bar {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  padding-top: 0.5rem;
}
```

---

## 4. Navigation & Layout Adaptations

```mermaid
graph TD
    subgraph Mobile Viewport (<768px)
        MobHeader[Compact Brand Header]
        MobContent[Single Column Scrollable Canvas]
        MobBottomBar[Fixed Bottom Bar: Home, Sermons, Give, Prayers, Menu]
        MobDrawer[Slide-out Sheet Drawer for Secondary Links]
    end

    subgraph Desktop Viewport (>=768px)
        DeskHeader[Full Top Navbar with Dropdown Menus]
        DeskContent[Multi-Column Grid & Persistent Sidebar]
        DeskFooter[Comprehensive Multi-Column Footer]
    end
```

---

## 5. Responsive Data Tables & Form Views

- **Mobile Card Transformation**: Financial statements and event registration rosters transform from tabular rows on desktop into discrete, elevated card summaries on mobile screens.
- **Scrollable Horizontal Wrappers**: Wide analytical charts and multi-column comparison tables utilize overflow scroll containers (`overflow-x-auto`) with subtle gradient scroll hints.

---

## 6. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Content cut off behind iPhone home indicator | Missing `env(safe-area-inset-bottom)` on fixed footer | Add `padding-bottom: env(safe-area-inset-bottom)` to the container. |
| Horizontal layout overflow on mobile | Fixed pixel width applied to child element (e.g. `w-[500px]`) | Replace fixed widths with responsive classes (`w-full max-w-[500px]`). |
| Mobile keyboard obscures input fields | Viewport height resizing abruptly on focus | Use `interactive-widget=resizes-content` in meta viewport tag. |

---

## Security Considerations
- Responsive layouts avoid hidden fields containing sensitive data that could be leaked to the DOM.

## Related Documentation
- [Frontend.md](Frontend.md) — Next.js component setup.
- [Browser-Compatibility.md](Browser-Compatibility.md) — Cross-device testing matrix.
- [Accessibility.md](Accessibility.md) — Mobile accessibility compliance.
