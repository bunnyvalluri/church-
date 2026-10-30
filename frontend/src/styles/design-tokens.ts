/**
 * src/styles/design-tokens.ts
 * Unified KCM Church White-Theme Design Tokens.
 * Strict contrast (WCAG 2.1 AA+ compliant), consistent spacing, and church branding.
 */

export const designTokens = {
  theme: 'light',
  colors: {
    // Pure White Backgrounds & Surfaces
    background: '#FFFFFF',
    surface: '#F8FAFC', // Slate 50
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F1F5F9', // Slate 100

    // Church Brand Palettes (Royal Violet & Warm Gold)
    brand: {
      primary: '#6D28D9', // Violet 700 - Accessible on white (4.8:1+)
      primaryHover: '#5B21B6', // Violet 800
      primarySubtle: '#EDE9FE', // Violet 100
      accentGold: '#B45309', // Amber 700 - High contrast text gold
      goldSubtle: '#FEF3C7', // Amber 100
    },

    // High Contrast Typography (Slate)
    text: {
      primary: '#0F172A', // Slate 900 - 16.5:1 contrast on white
      secondary: '#334155', // Slate 700 - 7.5:1 contrast
      muted: '#64748B', // Slate 500 - 4.6:1 contrast (WCAG AA compliant)
      inverse: '#FFFFFF',
    },

    // Borders & Dividers
    border: {
      subtle: '#E2E8F0', // Slate 200
      default: '#CBD5E1', // Slate 300
      focus: '#6D28D9', // Violet 700 ring
    },

    // Semantic Feedback
    status: {
      success: '#15803D', // Green 700
      successBg: '#DCFCE7', // Green 100
      warning: '#B45309', // Amber 700
      warningBg: '#FEF3C7', // Amber 100
      error: '#B91C1C', // Red 700
      errorBg: '#FEE2E2', // Red 100
      info: '#1D4ED8', // Blue 700
      infoBg: '#DBEAFE', // Blue 100
    },
  },

  // Consistent Radius
  radius: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    full: '9999px',
  },

  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
  },

  // Touch Target Compliance
  touchTarget: {
    minHeight: '44px',
    minWidth: '44px',
  },
} as const;

export type DesignTokens = typeof designTokens;

