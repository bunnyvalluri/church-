/**
 * src/i18n/index.ts
 * Centralized Internationalization engine with formatters for Indian numbering,
 * Telugu, Hindi, and English dates & currencies.
 */

export * from '../../i18n';

export type SupportedLocale = 'en' | 'te' | 'hi';

export function formatCurrencyINR(amount: number, locale: SupportedLocale = 'en'): string {
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
  };
  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateLocale(date: Date | string, locale: SupportedLocale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<SupportedLocale, string> = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
  };
  return new Intl.DateTimeFormat(localeMap[locale], {
    dateStyle: 'medium',
  }).format(d);
}

