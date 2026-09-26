# KCM Responsive Design & Mobile Breakpoint Matrix

## 1. Breakpoint Hierarchy

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| `xs` (< 480px) | Small Smartphones (iPhone SE, Galaxy A-series) | Single column, bottom navigation bar, collapsed headers, full-width modals |
| `sm` (480px - 767px) | Large Smartphones (iPhone Pro Max, Galaxy Ultra) | Compact grid (1-2 cols), floating action buttons |
| `md` (768px - 1023px)| Tablets (iPad, Galaxy Tab) | 2-column grid, collapsible sidebar, responsive tables |
| `lg` (1024px - 1439px)| Laptops & Small Desktops | Fixed sidebar, 3-column cards, full data tables |
| `xl` (1440px+) | Large Desktop Displays | Max container width constraint (1280px / 1440px centered), multi-column analytics |

## 2. Zero Horizontal Overflow Guarantee
- All containers use `max-w-full` with fluid padding (`px-4 sm:px-6 lg:px-8`).
- Complex tables wrap inside responsive scroll containers or transform into vertical stacked cards on viewports under 768px.
