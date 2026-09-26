# KCM Web Accessibility & WCAG 2.1 AA Compliance

## 1. Core Accessibility Standards
1. **Semantic Structure**: Proper single `<h1>` per page with hierarchical `<h2>`, `<h3>` heading levels.
2. **Keyboard Navigation**:
   - `Tab` / `Shift+Tab`: Predictable sequential navigation.
   - `Enter` / `Space`: Button and link activation.
   - `Escape`: Modal, drawer, and dropdown dismissal with focus restoration.
3. **Color Contrast**: 4.5:1 minimum contrast ratio for standard body text against white backgrounds; 3:1 for large headings and icons.
4. **Accessible Forms**: Explicit `<label htmlFor="...">` associations and `aria-invalid` / `aria-describedby` linkage on input validation errors.
