import { translations } from '@/i18n';

export const adminTranslations = {
  en: translations.en.admin,
  te: translations.te.admin,
  hi: translations.hi.admin,
};

export type AdminTranslationSchema = typeof translations.en.admin;
export default adminTranslations;
