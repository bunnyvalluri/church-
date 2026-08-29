import { en } from './locales/en';
import { te } from './locales/te';
import { hi } from './locales/hi';

export const translations = {
  en,
  te,
  hi,
};

export * from './config';
export * from './types/translations';
export * from './utils/language';
export * from './utils/translation';

export { en, te, hi };
export default translations;
