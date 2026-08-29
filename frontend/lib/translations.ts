/**
 * Translations Master Module — Kingdom of Christ Ministries
 *
 * Centralizes all multilingual dictionaries for English (en), Telugu (te), and Hindi (hi).
 * Re-exports the unified i18n core for application-wide compatibility.
 */

import { en } from '../i18n/locales/en';
import { te } from '../i18n/locales/te';
import { hi } from '../i18n/locales/hi';

export const translations = {
  en,
  te,
  hi,
};

export type Language = 'en' | 'te' | 'hi';
export type TranslationSchema = typeof en;

export { en, te, hi };
export default translations;
