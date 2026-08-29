import { translations } from '@/i18n';

export const legalTranslations = {
  en: translations.en.legal,
  te: translations.te.legal,
  hi: translations.hi.legal,
};

export type LegalTranslationSchema = typeof translations.en.legal;
export default legalTranslations;
