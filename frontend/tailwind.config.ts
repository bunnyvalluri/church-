import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './frontend/pages/**/*.{ts,tsx}',
    './frontend/components/**/*.{ts,tsx}',
    './frontend/app/**/*.{ts,tsx}',
    './frontend/src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Noto Sans Telugu", "Noto Sans Devanagari", "Noto Sans", "sans-serif"],
        heading: ["var(--font-outfit)", "Noto Sans Telugu", "Noto Sans Devanagari", "Noto Sans", "sans-serif"],
        outfit: ["var(--font-outfit)", "Noto Sans Telugu", "Noto Sans Devanagari", "Noto Sans", "sans-serif"],
        inter: ["var(--font-inter)", "Noto Sans Telugu", "Noto Sans Devanagari", "Noto Sans", "sans-serif"],
        telugu: ["'Noto Sans Telugu'", "sans-serif"],
        hindi: ["'Noto Sans Devanagari'", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        "gradient-start": "hsl(var(--primary-gradient-start))",
        "gradient-end": "hsl(var(--primary-gradient-end))",
        // High-contrast Purple scale compatible with light and dark mode
        purple: {
          50: "hsl(262 85% 96%)",
          100: "hsl(262 85% 90%)",
          200: "hsl(262 85% 82%)",
          300: "hsl(262 85% 74%)",
          400: "hsl(262 83% 66%)",
          500: "hsl(262 83% 58%)",
          600: "hsl(262 83% 52%)",
          700: "hsl(262 83% 42%)",
          800: "hsl(262 83% 32%)",
          900: "hsl(262 83% 22%)",
          950: "hsl(262 83% 14%)",
        },
        // High-contrast Indigo scale
        indigo: {
          50: "hsl(240 85% 96%)",
          100: "hsl(240 85% 90%)",
          200: "hsl(240 85% 82%)",
          300: "hsl(240 85% 74%)",
          400: "hsl(240 83% 66%)",
          500: "hsl(240 83% 58%)",
          600: "hsl(240 83% 48%)",
          700: "hsl(240 83% 38%)",
          800: "hsl(240 83% 28%)",
          900: "hsl(240 83% 20%)",
          950: "hsl(240 83% 12%)",
        },
        // High-contrast Violet scale
        violet: {
          50: "hsl(270 85% 96%)",
          100: "hsl(270 85% 90%)",
          200: "hsl(270 85% 82%)",
          300: "hsl(270 85% 74%)",
          400: "hsl(270 83% 66%)",
          500: "hsl(270 83% 58%)",
          600: "hsl(270 83% 48%)",
          700: "hsl(270 83% 38%)",
          800: "hsl(270 83% 28%)",
          900: "hsl(270 83% 20%)",
          950: "hsl(270 83% 12%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) scale(1.05)" },
          "50%": { transform: "translateY(20px) scale(1)" },
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.8)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-up": "fade-in-up 0.8s ease-out forwards",
        "fade-in-down": "fade-in-down 0.8s ease-out forwards",
        "slide-in": "slide-in 0.5s ease-out forwards",
        "slide-in-right": "slide-in-right 0.5s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "bounce-in": "bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        "float": "float 8s ease-in-out infinite",
        "float-delayed": "float-delayed 10s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "wiggle": "wiggle 1s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
