import { translations } from '@/i18n';

export const pastorTranslations = {
  en: translations.en.pastor,
  te: translations.te.pastor,
  hi: translations.hi.pastor,
};

export function getPastorTranslation(lang: string = 'en') {
  if (lang === 'te') return pastorTranslations.te;
  if (lang === 'hi') return pastorTranslations.hi;
  return pastorTranslations.en;
}

export type PastorTranslationSchema = typeof translations.en.pastor;
export default pastorTranslations;
