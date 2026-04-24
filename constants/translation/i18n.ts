import en from './en';
import my from './my';
import th from './th';

type LanguageType = 'my' | 'en' | 'th';

const translations = {
  en,
  my,
  th,
};

export const getTranslation = (lang: LanguageType) => {
   return translations[lang as keyof typeof translations] || en;
};